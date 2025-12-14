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
        this.cache = new SysCacheService(this.svConfig);
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
    async login(user) {
        const consumerGuid = this.cache.getConsumerGuid();
        if (!consumerGuid) {
            throw new Error("consumerGuid missing in SysCacheService");
        }
        EnvUserLogin.dat.f_vals[0].data = {
            userName: user.userName,
            password: user.password,
            consumerGuid,
        };
        this.logger.debug("[UserService] EnvUserLogin", inspect(EnvUserLogin, { depth: 4 }));
        const fx = await this.http.proc(EnvUserLogin, "cdApiLocal");
        if (!fx.state || !fx.data) {
            throw new Error(`Login request failed: ${fx.message}`);
        }
        const resp = fx.data;
        if (resp.app_state?.sess?.cd_token) {
            this.setCdToken(resp.app_state.sess.cd_token);
        }
        return resp;
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
