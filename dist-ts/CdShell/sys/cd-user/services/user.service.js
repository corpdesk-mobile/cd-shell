// // import { SqliteStore } from "../store/SqliteStore";
// // import { UserModel } from "../entities/UserModel";
import { HttpService } from "../../base/http.service";
import { EnvUserLogin, EnvUserProfile } from "../models/user.model";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { LoggerService } from "../../../utils/logger.service";
import { inspect } from "util";
import { ConfigService } from "../../moduleman/services/config.service";
export class UserService {
    constructor() {
        this.http = new HttpService();
        this.logger = new LoggerService();
        this.cdToken = "";
        this.svConfig = new ConfigService();
        // this.cache = new SysCacheService(this.svConfig);
        this.cache = SysCacheService.getInstance(this.svConfig);
    }
    // ---------------------------------------------
    // Token handling (mirrors ModuleRegisterService)
    // ---------------------------------------------
    setCdToken(token) {
        this.cdToken = token;
        EnvUserLogin.dat.token = token;
        EnvUserProfile.dat.token = token;
        return this;
    }
    // ---------------------------------------------
    // Login
    // ---------------------------------------------
    // async login(
    //   user: UserModel,
    //   consumerGuid: string
    // ): Promise<ICdResponse | null> {
    //   if (!consumerGuid) {
    //     this.logger.warn("[UserService.login] consumerGuid missing");
    //     return null;
    //   }
    //   EnvUserLogin.dat.f_vals[0].data = {
    //     userName: user.userName,
    //     password: user.password,
    //     consumerGuid,
    //   };
    //   this.logger.debug("[UserService.login] attempting login", {
    //     user: user.userName,
    //     consumerGuid,
    //   });
    //   try {
    //     const res = await this.http.proc(EnvUserLogin, "cdApiLocal");
    //     this.logger.debug("[UserService.login] res:", {
    //       res,
    //     });
    //     if (!res?.state || !res.data) {
    //       this.logger.warn("[UserService.login] login failed", {
    //         reason: res?.message,
    //       });
    //       return null;
    //     }
    //     const resp = res.data;
    //     if (resp.app_state?.sess?.cd_token) {
    //       this.setCdToken(resp.app_state.sess.cd_token);
    //     }
    //     return resp;
    //   } catch (err: any) {
    //     this.logger.warn("[UserService.login] network/login error", {
    //       message: err?.message,
    //     });
    //     return null;
    //   }
    // }
    async login(user, consumerGuid) {
        if (!consumerGuid) {
            this.logger.warn("[UserService.login] consumerGuid missing");
            return {
                state: false,
                message: "consumerGuid missing",
            };
        }
        EnvUserLogin.dat.f_vals[0].data = {
            userName: user.userName,
            password: user.password,
            consumerGuid,
        };
        this.logger.debug("[UserService.login] attempting login", {
            user: user.userName,
            consumerGuid,
        });
        try {
            const fx = await this.http.proc(EnvUserLogin, "cdApiLocal");
            this.logger.debug("[UserService.login] fx:", fx);
            if (!fx?.state || !fx.data) {
                this.logger.warn("[UserService.login] login failed", {
                    reason: fx?.message,
                });
                return fx;
            }
            const resp = fx.data;
            if (resp.app_state?.sess?.cd_token) {
                this.setCdToken(resp.app_state.sess.cd_token);
            }
            return fx;
        }
        catch (err) {
            this.logger.warn("[UserService.login] network/login error", {
                message: err?.message,
            });
            return {
                state: false,
                message: err?.message ?? "login error",
            };
        }
    }
    // ===================================================================
    // ANON LOGIN
    // ===================================================================
    // async loginAnonUser(consumerGuid: string): Promise<ICdResponse | void> {
    //   this.logger.debug("[UserService.loginAnonUser] Performing anon login");
    //   // const consumerGuid = this.svSysCache.getConsumerGuid();
    //   this.logger.debug("[UserService.loginAnonUser] consumerGuid", consumerGuid);
    //   if (!consumerGuid) {
    //     this.logger.warn(
    //       "[UserService.loginAnonUser] No consumerGuid → skipping anon login"
    //     );
    //     return;
    //   }
    //   const anonUser: UserModel = {
    //     userName: "anon",
    //     password: "-",
    //   };
    //   const resp = await this.login(anonUser, consumerGuid);
    //   this.logger.debug("[UserService.loginAnonUser] resp:", resp);
    //   if (!resp) {
    //     this.logger.warn(
    //       "[UserService.loginAnonUser] anon login failed → continuing with static shell config"
    //     );
    //     return;
    //   }
    //   this.logger.debug("[UserService.loginAnonUser] anon login success");
    //   // this.consumerProfile = resp.data.consumer.consumerProfile || null;
    //   // this.userProfile = resp.data.userData.userProfile || null;
    //   return resp
    // }
    async loginAnonUser(consumerGuid) {
        this.logger.debug("[UserService.loginAnonUser] Performing anon login");
        this.logger.debug("[UserService.loginAnonUser] consumerGuid", consumerGuid);
        if (!consumerGuid) {
            this.logger.warn("[UserService.loginAnonUser] No consumerGuid → skipping anon login");
            return null;
        }
        const anonUser = {
            userName: "anon",
            password: "-",
        };
        const fx = await this.login(anonUser, consumerGuid);
        this.logger.debug("[UserService.loginAnonUser] fx:", fx);
        if (!fx?.state || !fx.data) {
            this.logger.warn("[UserService.loginAnonUser] anon login failed → continuing with static shell config");
            return fx;
        }
        this.logger.debug("[UserService.loginAnonUser] anon login success");
        return fx;
    }
    // ---------------------------------------------
    // Fetch user profile
    // ---------------------------------------------
    async getUserProfile(userId) {
        const consumerGuid = this.cache.getConsumerGuid();
        if (!consumerGuid) {
            throw new Error("consumerGuid missing in SysCacheService");
        }
        EnvUserProfile.dat.f_vals[0].data.userId = userId;
        EnvUserProfile.dat.f_vals[0].data.consumerGuid = consumerGuid;
        EnvUserProfile.dat.token = this.cdToken;
        this.logger.debug("[UserService] EnvUserProfile", inspect(EnvUserProfile, { depth: 4 }));
        const fx = await this.http.proc(EnvUserProfile, "cdApiLocal");
        if (!fx.state || !fx.data) {
            throw new Error(`Profile request failed: ${fx.message}`);
        }
        return fx.data;
    }
    async getUserByID(userId) {
        const consumerGuid = this.cache.getConsumerGuid();
        if (!consumerGuid) {
            throw new Error("consumerGuid missing in SysCacheService");
        }
        const req = {
            ctx: "Sys",
            m: "User",
            c: "User",
            a: "GetByID",
            dat: {
                f_vals: [
                    {
                        data: {
                            userId,
                            consumerGuid,
                        },
                    },
                ],
                token: this.cdToken,
            },
            args: null,
        };
        this.logger.debug("[UserService] getUserByID request", inspect(req, { depth: 4 }));
        const fx = await this.http.proc(req, "cdApiLocal");
        if (!fx.state || !fx.data) {
            throw new Error(`GetByID request failed: ${fx.message}`);
        }
        return fx.data;
    }
    async existingUserProfile(userId) {
        try {
            const resp = await this.getUserProfile(userId);
            if (resp.app_state.success &&
                resp.data &&
                Array.isArray(resp.data) &&
                resp.data.length > 0) {
                const profile = resp.data[0];
                return profile !== null && profile !== undefined;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`[UserService] existingUserProfile error: ${error.message}`);
            return false;
        }
    }
}
