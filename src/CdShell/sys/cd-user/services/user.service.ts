// // import { SqliteStore } from "../store/SqliteStore";
// // import { UserModel } from "../entities/UserModel";

// import { ObjectLiteral } from "typeorm";
// import { cloneDeep } from "lodash";
// import {
//   CD_FX_FAIL,
//   CdFxReturn,
//   CreateIParams,
//   ICdResponse,
//   IQuery,
//   IRespInfo,
//   IServiceInput,
// } from "../../base/i-base.js";
// import { DocModel } from "../../moduleman/models/doc.model.js";
// import {
//   IUserProfile,
//   UserModel,
//   userProfileDefault,
// } from "../models/user.model.js";
// import CdLog from "../../cd-comm/controllers/cd-logger.controller.js";
// // import { BaseService } from '../../base/base.service.js';
// import config from "../../../../config.js";
// import { HttpService } from "../../base/http.service.js";
// import { GenericService } from "../../base/generic-service.js";
// import { SessionService } from "./session.service.js";
// import { ISessionDataExt } from "../models/session.model.js";
// import { LoggerService } from "../../../utils/logger.service.js";
// import { ProfileServiceHelper } from "../../utils/profile-service-helper.js";
// import { AppStateService } from "../../base/app-state.service.js";
// import { ConsumerModel } from "../../moduleman/models/consumer.model.js";

// // import { ProfileServiceHelper } from '../../utils/profile-service-helper.js';

// export class UserService extends GenericService<UserModel> {
//   // b = new BaseService<UserModel>();
//   private svAppState: AppStateService;
//   // private svServer: ServerService;
//   private svHttp: HttpService;
//   public svSocket: SocketIoService;
//   public svSio: SioClientService;
//   private env: EnvConfig;

//   private logger = new LoggerService();

//   private postData: any;
//   cd_token: string | undefined = "";
//   userData: User[] = [];
//   cuid = "";
//   userName = "";
//   fullName = "";
//   contacts = [];
//   allUsers = [];
//   cuidAvatar = "";
//   currentUser: any;
//   currentProfile: any = {
//     name: "Login/Register",
//     picture: "assets/cd/branding/coop/avatarCircle.svg",
//   };
//   pals: any;
//   public usersData$: Observable<UserData[]>;
//   // CdResponse
//   public userDataResp$: Observable<any>;
//   isInvalidSelUsers = true;
//   selectedUsers: User[] = [];

//   ///////////////////////////////////////////////////////////////////////////////////////////////
//   // ADAPTATION FROM GENERIC SERVICE
//   constructor() {
//     super();
//     this.svSio.setEnv(this.env);
//     this.svSio.initSio();
//   }

//   // /**
//   //  * Validate input before processing create
//   //  */
//   // async validateCreate(pl: UserModel): Promise<CdFxReturn<boolean>> {
//   //   const retState = true;
//   //   // Ensure required fields exist
//   //   for (const field of this.cRules.required) {
//   //     if (!pl[field]) {
//   //       return {
//   //         data: false,
//   //         state: false,
//   //         message: `Missing required field: ${field}`,
//   //       };
//   //     }
//   //   }

//   //   // Check for duplicates
//   //   const query = {
//   //     where: {
//   //       userName: pl.userName,
//   //       email: pl.email,
//   //     },
//   //   };
//   //   const serviceInput: IServiceInput<UserModel> = {
//   //     serviceModel: UserModel,
//   //     docName: 'Validate Duplicate User',
//   //     dSource: 1,
//   //     cmd: { query },
//   //   };

//   //   const existingRecords = await this.b.read(null, null, serviceInput);
//   //   if ('state' in existingRecords && 'data' in existingRecords) {
//   //     if (!existingRecords.state || !existingRecords.data) {
//   //       return { data: false, state: false, message: 'Validation failed' };
//   //     }

//   //     if (existingRecords.data.length > 0) {
//   //       return { data: true, state: true, message: 'Validation passed' };
//   //     } else {
//   //       return { data: false, state: false, message: 'Validation failed' };
//   //     }
//   //   }

//   //   return { data: false, state: false, message: 'Validation failed' };
//   // }

//   // /**
//   //  * Fetch newly created record by guid
//   //  */
//   // async afterCreate(
//   //   pl: UserModel,
//   // ): Promise<CdFxReturn<UserModel | ObjectLiteral | null >> {
//   //   const query = {
//   //     where: { userGuid: pl.userGuid },
//   //   };

//   //   const serviceInput = {
//   //     serviceModel: UserModel,
//   //     docName: 'Fetch Created User',
//   //     dSource: 1,
//   //     cmd: { query },
//   //   };

//   //   const retResult = await this.b.read(null, null, serviceInput);
//   //   if ('state' in retResult) {
//   //     return retResult;
//   //   } else {
//   //     return CD_FX_FAIL;
//   //   }
//   // }

//   // async getUser(
//   //   q: IQuery,
//   // ): Promise<CdFxReturn<UserModel[] | ObjectLiteral[] | unknown>> {
//   //   // Validate query input
//   //   if (!q || !q.where || Object.keys(q.where).length === 0) {
//   //     return {
//   //       data: null,
//   //       state: false,
//   //       message: 'Invalid query: "where" condition is required',
//   //     };
//   //   }

//   //   const serviceInput = {
//   //     serviceModel: UserModel,
//   //     docName: 'UserService::getUser',
//   //     cmd: {
//   //       action: 'find',
//   //       query: q,
//   //     },
//   //     dSource: 1,
//   //   };

//   //   try {
//   //     const retResult = await this.b.read(null, null, serviceInput);

//   //     if ('state' in retResult) {
//   //       return retResult;
//   //     } else {
//   //       return CD_FX_FAIL;
//   //     }
//   //   } catch (e: any) {
//   //     CdLog.error(`UserService.getUser() - Error: ${e.message}`);
//   //     return {
//   //       data: null,
//   //       state: false,
//   //       message: `Error retrieving User: ${e.message}`,
//   //     };
//   //   }
//   // }

//   // beforeUpdate(q: any) {
//   //   if (q.update.CoopEnabled === '') {
//   //     q.update.CoopEnabled = null;
//   //   }
//   //   return q;
//   // }

//   // async getUserByID(req, res, uid) {
//   //   const serviceInput = {
//   //     serviceInstance: this,
//   //     serviceModel: UserModel,
//   //     docModel: DocModel,
//   //     docName: 'UserService::getUserByID',
//   //     cmd: {
//   //       action: 'find',
//   //       query: { where: { userId: uid } },
//   //     },
//   //     dSource: 1,
//   //   };
//   //   return await this.b.read(req, res, serviceInput);
//   // }

//   // // async existingUserProfile(req, res, cuid) {
//   // //   const si: IServiceInput<UserModel> = {
//   // //     serviceInstance: this,
//   // //     serviceModel: UserModel,
//   // //     docName: 'UserService::existingUserProfile',
//   // //     cmd: {
//   // //       query: { where: { userId: cuid } },
//   // //     },
//   // //     mapping: { profileField: 'userProfile' },
//   // //   };
//   // //   return ``
//   // // }

//   // // async modifyProfile(existingData, profileConfig) {
//   // //   return await {}
//   // // }

//   // // Helper method to validate profile data
//   // // async validateProfileData(req, res, profileData: any): Promise<boolean> {
//   // //   CdLog.debug('UserService::validateProfileData()/profileData:', profileData);
//   // //   // const profileData: IUserProfile = updateData.update.userProfile
//   // //   // CdLog.debug("UserService::validateProfileData()/profileData:", profileData)
//   // //   // Check if profileData is null or undefined
//   // //   if (!profileData) {
//   // //     CdLog.debug('UserService::validateProfileData()/01');
//   // //     return false;
//   // //   }

//   // //   // Validate that the required fields of IUserProfile exist
//   // //   if (!profileData.fieldPermissions || !profileData.userData) {
//   // //     CdLog.debug('UserService::validateProfileData()/02');
//   // //     return false;
//   // //   }

//   // //   // Example validation for bio length
//   // //   if (profileData.bio && profileData.bio.length > 500) {
//   // //     CdLog.debug('UserService::validateProfileData()/03');
//   // //     const e = 'Bio data is too long';
//   // //     this.b.err.push(e);
//   // //     const i = {
//   // //       messages: this.b.err,
//   // //       code: 'UserService:validateProfileData',
//   // //       app_msg: '',
//   // //     };
//   // //     await this.b.serviceErr(req, res, e, i.code);
//   // //     return false; // Bio is too long
//   // //   }
//   // //   return true;
//   // // }

//   // // login(fg: any) {
//   // //   console.info("starting cd-user/LoginComponent::login");
//   // //   let authData: AuthData = fg.value;
//   // //   const valid = fg.valid;
//   // //   console.info("cd-user/LoginComponent::login/01");
//   // //   console.info("cd-user/LoginComponent::login/fg:", fg);
//   // //   console.info("cd-user/LoginComponent::login/valid:", valid);
//   // //   this.submitted = true;
//   // //   const consumerGuid = { consumerGuid: environment.consumerToken };
//   // //   authData = Object.assign({}, authData, consumerGuid); // merge data with consumer object
//   // //   try {
//   // //     console.info("cd-user/LoginComponent::login/02");
//   // //     if (valid) {
//   // //       console.info("cd-user/LoginComponent::login/03");
//   // //       this.initSession(authData);
//   // //     }
//   // //   } catch (err) {
//   // //     console.info("cd-user/LoginComponent::login/04");
//   // //     this.errMsg = "Something went wrong!!";
//   // //     this.loginInvalid = true;
//   // //   }
//   // // }

//   // // /**
//   // //  * Following login request to cd-api server, this method is called to
//   // //  * 1. Create a session via svSess.createSess()
//   // //  * 2. Save current user data in svUser.currentUser
//   // //  * 3. Set user menu in svNav.userMenu
//   // //  * 4. Notify cd-shell/SidbarComponent of login status while availing menu data to cd-shell/SidebarComponent via cd-sio server
//   // //  * 5. Navigate to the initial page defined in environment.initialPage
//   // //  * @param authData
//   // //  */
//   // // initSession(authData: AuthData) {
//   // //   console.info("cd-user/LoginComponent::initSession/01");
//   // //   this.svUser.auth$(authData).subscribe((res: any) => {
//   // //     if (res.app_state.success === true) {
//   // //       console.info(
//   // //         "cd-user/LoginComponent::initSession/res:",
//   // //         JSON.stringify(res)
//   // //       );
//   // //       this.svSess.appState = res.app_state;
//   // //       /*
//   // //       create a session on successfull authentication.
//   // //       For subsequeng successull request to the server,
//   // //       use renewSess(res);
//   // //       */
//   // //       if (res.app_state.sess.cd_token !== null && res.app_state.success) {
//   // //         console.info("cd-user/LoginComponent::initSession/02");

//   // //         /**
//   // //          * Prepare the push payload to send menu data to cd-shell/SidebarComponent
//   // //          */
//   // //         const envl: ICdPushEnvelop = this.configPushPayload(
//   // //           "login",
//   // //           "push-menu",
//   // //           res.data.userData.userId
//   // //         );
//   // //         envl.pushData.m = res.data.menuData;
//   // //         envl.pushData.token = res.app_state.sess.cd_token;
//   // //         console.info("cd-user/LoginComponent::initSession/envl:", envl);

//   // //         /**
//   // //          * Send the menu data to cd-shell/SidebarComponent via the cd-sio server
//   // //          */
//   // //         if (environment.wsMode === "sio") {
//   // //           console.info(
//   // //             "cd-user/LoginComponent::initSession/envl:...using sio"
//   // //           );
//   // //           this.sendSioMessage(envl);
//   // //         }

//   // //         /**
//   // //          * If environment.wsMode is set to wss, then use the WebSocketService to send the menu data to cd-shell/SidebarComponent via the cd-sio server
//   // //          */
//   // //         if (environment.wsMode === "wss") {
//   // //           console.info(
//   // //             "cd-user/LoginComponent::initSession/envl:...using wss"
//   // //           );
//   // //           this.svWss.sendMsg(envl);
//   // //         }

//   // //         ///////////////////////////////////////
//   // //         this.svSess.createSess(res, this.svMenu);
//   // //         this.svUser.currentUser = {
//   // //           name: `${res.data.userData.userName}`,
//   // //           picture: `${environment.shellHost}/user-resources/${res.data.userData.userGuid}/avatar-01/a.jpg`,
//   // //         };
//   // //         this.svNav.userMenu = [
//   // //           { title: "Profile", link: "/pages/cd-auth/register" },
//   // //           { title: "Log out", link: "/pages/cd-auth/logout" },
//   // //         ];
//   // //         // this.baseModel.sess = res.app_state.sess;
//   // //         const params = {
//   // //           queryParams: { token: res.app_state.sess.cd_token },
//   // //           skipLocationChange: true,
//   // //           replaceUrl: false,
//   // //         };
//   // //         // below: old method
//   // //         // this.route.navigate(['/comm'], params);
//   // //         // this.route.navigate(['/dashboard'], params);
//   // //         this.route.navigate([environment.initialPage], params);

//   // //         // below new method based on this.baseModel;
//   // //         // this.svNav.nsNavigate(this,'/comm','message from cd-user')
//   // //       }
//   // //     } else {
//   // //       this.errMsg = "The userName and password were not valid";
//   // //       this.loginInvalid = true;
//   // //       this.svSess.logout();
//   // //     }
//   // //   });
//   // // }

//   // ///////////////////////////////////////////////////////////////////////////////////

//   // //////////////////////////////////////////////////////////////////////////////////////////////////
//   // // STARTING USER PROFILE FEATURES
//   // // Public method to update user profile (e.g., avatar, bio)
//   // async updateUserProfile(req, res): Promise<void> {
//   //   try {
//   //     // note that 'ignoreCache' is set to true because old data may introduce confussion
//   //     const svSess = new SessionService();
//   //     const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
//   //       req,
//   //       res,
//   //       true
//   //     );
//   //     this.logger.debug(
//   //       "UserService::updateCurrentUserProfile()/sessionDataExt:",
//   //       sessionDataExt
//   //     );

//   //     const requestQuery: IQuery = req.post.dat.f_vals[0].query;
//   //     const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
//   //     let modifiedUserProfile = {} as IUserProfile;
//   //     let strUserProfile = "{}";

//   //     const existingUserProfile = await this.existingUserProfile(
//   //       req,
//   //       res,
//   //       sessionDataExt.currentUser.userId
//   //     );
//   //     this.logger.debug(
//   //       "UserService:updateCurrentUserProfile()/existingUserProfile:",
//   //       existingUserProfile
//   //     );

//   //     if (await this.validateProfileData(req, res, existingUserProfile)) {
//   //       /*
//   //               - if not null and is valid data
//   //                   - use jsonUpdate to update currentUserProfile
//   //                       use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
//   //                   - use session data to modify 'userData' in the default user profile
//   //                   -
//   //               */
//   //       this.logger.debug("UserService::updateUserProfile()/01");
//   //       this.logger.debug(
//   //         "UserService::updateCurrentUserProfile()/jsonUpdate:",
//   //         jsonUpdate
//   //       );
//   //       this.logger.debug(
//   //         "UserService::updateCurrentUserProfile()/existingUserProfile:",
//   //         existingUserProfile
//   //       );
//   //       modifiedUserProfile = await this.modifyProfile(
//   //         existingUserProfile,
//   //         jsonUpdate
//   //       );
//   //       this.logger.debug(
//   //         "UserService::updateUserProfile()/strUserProfile2:",
//   //         modifiedUserProfile
//   //       );
//   //       strUserProfile = JSON.stringify(modifiedUserProfile);
//   //     } else {
//   //       /*
//   //               - if null or invalid,
//   //                   - take the default json data defined in the UserModel,
//   //                   - update userData using sessionData, then
//   //                   - do update based on given jsonUpdate in the api request
//   //                   - converting to string and then updating the userProfile field in the row/s defined in query.where property.
//   //               */
//   //       this.logger.debug("UserService::updateUserProfile()/021");
//   //       const { password, userProfile, ...filteredUserData } =
//   //         sessionDataExt.currentUser;
//   //       userProfileDefault.userData = filteredUserData;
//   //       this.logger.debug(
//   //         "UserService::updateUserProfile()/userProfileDefault:",
//   //         userProfileDefault
//   //       );
//   //       modifiedUserProfile = (await this.modifyProfile(
//   //         userProfileDefault,
//   //         jsonUpdate
//   //       )) as IUserProfile;
//   //       // the update should not contain userData
//   //       if ("userData" in modifiedUserProfile) {
//   //         delete modifiedUserProfile.userData;
//   //       }

//   //       this.logger.debug(
//   //         "UserService::updateUserProfile()/modifiedUserProfile:",
//   //         modifiedUserProfile
//   //       );
//   //       strUserProfile = JSON.stringify(modifiedUserProfile);
//   //     }

//   //     this.logger.debug("UserService::updateUserProfile()/03");
//   //     requestQuery.update = { userProfile: strUserProfile };
//   //     this.logger.debug(
//   //       "UserService::updateUserProfile()/requestQuery:",
//   //       JSON.stringify(requestQuery)
//   //     );

//   //     // update user profile
//   //     const serviceInput: IServiceInput<UserModel> = {
//   //       serviceInstance: this,
//   //       serviceModel: UserModel,
//   //       docName: "UserService::updateUserProfile",
//   //       dSource: 1,
//   //       cmd: {
//   //         action: "update",
//   //         query: requestQuery,
//   //       },
//   //     };
//   //     this.logger.debug(
//   //       "UserService::updateUserProfile()/serviceInput:",
//   //       serviceInput
//   //     );
//   //     // const ret = await this.b.updateJSONColumn(req, res, serviceInput)
//   //     const updateRet = await this.updateI(req, res, serviceInput);
//   //     const resultNewProfile = await this.existingUserProfile(
//   //       req,
//   //       res,
//   //       requestQuery.where.userId
//   //     ) as CdFxReturn<UserModel[]> ;
//   //     this.logger.debug(
//   //       "UserService::updateUserProfile()/resultNewProfile:",
//   //       JSON.stringify(resultNewProfile)
//   //     );

//   //     if (!resultNewProfile.state || !resultNewProfile.data) {
//   //       // throw new Error('Failed to retrieve updated user profile');
//   //       this.b.err.push('Failed to retrieve updated user profile');
//   //       const i = {
//   //         messages: this.b.err,
//   //         code: 'UserService:updateUserProfile',
//   //         app_msg: '',
//   //       };
//   //       await this.b.serviceErr(req, res, 'Failed to retrieve updated user profile', i.code);
//   //       return null;
//   //       // return;
//   //     }

//   //     const newProfile = resultNewProfile.data;
//   //     this.logger.debug(
//   //       "UserService::updateUserProfile()/newProfile1:",
//   //       JSON.stringify(newProfile)
//   //     );

//   //     /**
//   //      * No password is droped from the payload
//   //      */
//   //     if ("userData" in newProfile[0]) {
//   //       const userData = newProfile[0].userData as Record<string, unknown>;
//   //       if ("password" in userData) {
//   //         delete userData.password;
//   //       }
//   //     }

//   //     this.logger.debug(
//   //       "UserService::updateUserProfile()/newProfile2:",
//   //       JSON.stringify(newProfile)
//   //     );
//   //     const ret = {
//   //       updateRet: updateRet,
//   //       newProfile: newProfile,
//   //     };

//   //     // Respond with the retrieved profile data
//   //     this.b.cdResp.data = ret;
//   //     return null;
//   //   } catch (e) {
//   //     this.b.err.push(e.toString());
//   //     const i = {
//   //       messages: this.b.err,
//   //       code: "UserService:updateUserProfile",
//   //       app_msg: "",
//   //     };
//   //     await this.b.serviceErr(req, res, e, i.code);
//   //     return null;
//   //   }
//   // }

//   // /////////////////////////////////////////////
//   // // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
//   // //

//   // async existingUserProfile(req, res, cuid) {
//   //   this.logger.debug(`UserServices::existingUserProfile())/cuid:${cuid}`);
//   //   const si: IServiceInput<any> = {
//   //     serviceInstance: this,
//   //     serviceModel: UserModel,
//   //     docName: "UserService::existingUserProfile",
//   //     dSource: 1,
//   //     cmd: {
//   //       action: "find",
//   //       query: { select: ["userProfile"], where: { userId: cuid } },
//   //     },
//   //     // mapping: { profileField: "userProfile" },
//   //   };
//   //   return this.b.read(req, res, si);
//   // }

//   // async modifyProfile(existingData, profileConfig) {
//   //   return await ProfileServiceHelper.modifyProfile(
//   //     existingData,
//   //     profileConfig
//   //   );
//   // }

//   // async getUserProfile(req, res) {
//   //   try {
//   //     this.logger.debug("UserService::getUserProfile()/01");
//   //     const pl = await this.b.getPlData(req);
//   //     const userId = pl.userId;

//   //     // Retrieve the user profile using an internal method
//   //     const profile = await this.getUserProfileI(req, res, userId);
//   //     if (profile) {
//   //       this.logger.debug("UserService::getUserProfile()/02");
//   //       this.b.i.code = "UserService::getUserProfile";
//   //       const svSess = new SessionService();
//   //       svSess.sessResp.cd_token = req.post.dat.token;
//   //       svSess.sessResp.ttl = svSess.getTtl();
//   //       await this.b.setAppState(true, this.b.i, svSess.sessResp);
//   //       this.b.cdResp.data = profile;
//   //       return null;
//   //     } else {
//   //       this.logger.debug("UserService::getUserProfile()/03");
//   //       const e = "the user provided is invalid";
//   //       this.b.err.push(e);
//   //       const i = {
//   //         messages: this.b.err,
//   //         code: "UserService:getProfile",
//   //         app_msg: "",
//   //       } as IRespInfo;
//   //       this.b.serviceErr(req, res, e, i.code);
//   //       this.b.respond(req, res);
//   //     }
//   //   } catch (e) {
//   //     this.logger.debug("UserService::getUserProfile()/04");
//   //     this.b.err.push(e.toString());
//   //     const i = {
//   //       messages: this.b.err,
//   //       code: "UserService:getProfile",
//   //       app_msg: "",
//   //     };
//   //     this.b.serviceErr(req, res, e, i.code);
//   //     this.b.respond(req, res);
//   //   }
//   // }

//   // // Public method to get a user profile
//   // async getCurrentUserProfile(req, res) {
//   //   try {
//   //     const svSession = new SessionService();
//   //     const q = {where: { cdToken: req.post.dat.token }};
//   //     const session = await svSession.getSession(q);
//   //     const userId = session[0].currentUserId;
//   //     this.logger.debug(
//   //       `UserServices::getCurrentUserProfile9)/userId:${userId}`
//   //     );
//   //     // Retrieve the user profile using an internal method
//   //     const profile = await this.getUserProfileI(req, res, userId);

//   //     // Respond with the retrieved profile data
//   //     this.b.cdResp.data = profile;
//   //     return null;
//   //   } catch (e) {
//   //     this.b.err.push(e.toString());
//   //     const i = {
//   //       messages: this.b.err,
//   //       code: "UserService:getProfile",
//   //       app_msg: "",
//   //     };
//   //     await this.b.serviceErr(req, res, e, i.code);
//   //     return null;
//   //   }
//   // }

//   // // Internal method to retrieve user profile
//   // async getUserProfileI(
//   //   req,
//   //   res,
//   //   userId: number
//   // ): Promise<IUserProfile | null> {
//   //   try {
//   //     this.logger.debug("UserServices::getUserProfileI()/01");
//   //     this.logger.debug("UserServices::getUserProfileI()/userId:", userId);
//   //     // // Use BaseService to retrieve user profile
//   //     // const result = await this.b.read(req, res, serviceInput);
//   //     const resultUser = await this.getUserByID(req, res, userId) as CdFxReturn<UserModel[]>;
//   //     if(!resultUser.state || !resultUser.data){
//   //       // throw new Error('Failed to retrieve user data');
//   //       this.b.err.push('Failed to retrieve user data');
//   //       const i = {
//   //         messages: this.b.err,
//   //         code: 'UserService:getUserProfileI',
//   //         app_msg: '',
//   //       };
//   //       await this.b.serviceErr(req, res, 'Failed to retrieve user data', i.code);
//   //       return null;
//   //       // return null;
//   //     }
//   //     const user = resultUser.data as UserModel[];
//   //     this.logger.debug(
//   //       "UserServices::getUserProfileI()/user:",
//   //       JSON.stringify(user)
//   //     );
//   //     this.logger.debug("UserServices::getUserProfileI()/02");
//   //     if (user && user[0].userProfile) {
//   //       this.logger.debug("UserServices::getUserProfileI()/03");
//   //       delete user[0].password;
//   //       // Create a deep copy of user[0].userProfile to avoid circular references
//   //       let userProfileJSON: IUserProfile = cloneDeep(user[0]); // deep copy using lodash

//   //       this.logger.debug("UserServices::getUserProfileI()/04");
//   //       let userData: UserModel = cloneDeep(user[0]);
//   //       // delete userData.userProfile;
//   //       delete userData.password;
//   //       userProfileJSON = cloneDeep(userData.userProfile) as IUserProfile;
//   //       userProfileJSON.userData = cloneDeep(userData);
//   //       delete(userProfileJSON.userData.userProfile);

//   //       this.logger.debug("UserServices::getUserProfileI()/06");
//   //       return userProfileJSON; // Return the cloned userProfileJSON
//   //     } else {
//   //       this.logger.debug("UserServices::getUserProfileI()/07");
//   //       /**
//   //        * If the profile is null update records to default then return the default profile
//   //        */
//   //       // update user profile with default
//   //       const serviceInput: IServiceInput<any> = {
//   //         serviceInstance: this,
//   //         serviceModel: UserModel,
//   //         docName: "UserService::getUserProfileI",
//   //         dSource: 1,
//   //         cmd: {
//   //           action: "update",
//   //           query: {
//   //             where: { userId: user[0].userId },
//   //             update: { userProfile: JSON.stringify(userProfileDefault) },
//   //           },
//   //         },
//   //       };
//   //       this.logger.debug(
//   //         "UserService::updateCurrentUserProfile()/serviceInput:",
//   //         serviceInput
//   //       );
//   //       // const ret = await this.b.updateJSONColumn(req, res, serviceInput)
//   //       const resultUpdateRet = await this.updateI(req, res, serviceInput);
//   //       if (!resultUpdateRet || !('affected' in resultUpdateRet)) {
//   //         // throw new Error('Failed to update user profile to default');
//   //         this.b.err.push('Failed to update user profile to default');
//   //         const i = {
//   //           messages: this.b.err,
//   //           code: 'UserService:getUserProfileI',
//   //           app_msg: '',
//   //         };
//   //         await this.b.serviceErr(req, res, 'Failed to update user profile to default', i.code);
//   //         return null;
//   //         // return null;
//   //       }
//   //       const updateRet = resultUpdateRet;
//   //       this.logger.debug(
//   //         "UserService::getUserProfileI()/updateRet:",
//   //         updateRet
//   //       );
//   //       if (updateRet.affected > 0) {
//   //         return userProfileDefault;
//   //       } else {
//   //         return null;
//   //       }
//   //     }
//   //   } catch (e) {
//   //     this.logger.debug("UserServices::getUserProfileI()/08");
//   //     this.b.err.push(`The user provided is invalid; ${e.toString()}`);
//   //     const i = {
//   //       messages: this.b.err,
//   //       code: "UserService:getProfile",
//   //       app_msg: "",
//   //     };
//   //     await this.b.serviceErr(req, res, e, i.code);
//   //     return null;
//   //   }
//   // }

//   // // Internal method to handle profile updates
//   // async updateUserProfileI(
//   //   req,
//   //   res,
//   //   userId: string,
//   //   newProfileData: Partial<IUserProfile>
//   // ) {
//   //   try {
//   //     // Use BaseService method to handle JSON updates for user_profile field
//   //     const serviceInput = {
//   //       serviceModel: UserModel,
//   //       cmd: {
//   //         query: {
//   //           where: { user_id: userId },
//   //           update: { user_profile: newProfileData },
//   //         },
//   //       },
//   //     };

//   //     await this.b.updateJSONColumnQB(
//   //       req,
//   //       res,
//   //       serviceInput,
//   //       "user_profile",
//   //       newProfileData
//   //     );
//   //     return newProfileData; // Return updated profile
//   //   } catch (error) {
//   //     // throw new Error(`Error updating user profile: ${error.message}`);
//   //     this.b.err.push(`Error updating user profile: ${error.message}`);
//   //     const i = {
//   //       messages: this.b.err,
//   //       code: "UserService:updateUserProfileI",
//   //       app_msg: "",
//   //     };
//   //     await this.b.serviceErr(req, res, error, i.code);
//   //     return null;
//   //   }
//   // }

//   // // Helper method to validate profile data
//   // async validateProfileData(req, res, profileData: any): Promise<boolean> {
//   //   this.logger.debug(
//   //     "UserService::validateProfileData()/profileData:",
//   //     profileData
//   //   );
//   //   // const profileData: IUserProfile = updateData.update.userProfile
//   //   // this.logger.debug("UserService::validateProfileData()/profileData:", profileData)
//   //   // Check if profileData is null or undefined
//   //   if (!profileData) {
//   //     this.logger.debug("UserService::validateProfileData()/01");
//   //     return false;
//   //   }

//   //   // Validate that the required fields of IUserProfile exist
//   //   if (!profileData.fieldPermissions || !profileData.userData) {
//   //     this.logger.debug("UserService::validateProfileData()/02");
//   //     return false;
//   //   }

//   //   // Example validation for bio length
//   //   if (profileData.bio && profileData.bio.length > 500) {
//   //     this.logger.debug("UserService::validateProfileData()/03");
//   //     const e = "Bio data is too long";
//   //     this.b.err.push(e);
//   //     const i = {
//   //       messages: this.b.err,
//   //       code: "UserService:validateProfileData",
//   //       app_msg: "",
//   //     };
//   //     await this.b.serviceErr(req, res, e, i.code);
//   //     return false; // Bio is too long
//   //   }
//   //   return true;
//   // }

//   async init(): Promise<void> {
//     console.log("starting SignInController::init()");
//     // Initialize HttpService
//     const httpService = new HttpService(true); // Enable debug mode
//     const baseUrl = await httpService.getCdApiUrl(config.cdApiLocal);
//   }

//   async auth(data: {
//     user: UserModel;
//     consumer: ConsumerModel;
//   }): Promise<void> {
//     console.log("starting SignInController:auth()");
//     console.log("SignInController:auth()/data:", data);
//     window.cdShell?.progress?.start("Signing in...");
//     try {
//       const request = this.b.buildBaseRequest(
//         { ctx: "Sys", name: "User" },
//         { name: "User" },
//         "Login",
//         { data: data.user, consumer: data.consumer },
//         null
//       );

//       const result = (await this.b.handleRequest(request)) as ICdResponse;
//       if (result.app_state.success) {
//         window.cdShell?.notify?.success("Login successful");
//         window.cdShell?.progress?.done();
//         // Proceed to dashboard or main shell load
//       } else {
//         window.cdShell?.notify?.error(
//           result.app_state.info.app_msg || "Login failed"
//         );
//       }
//     } catch (e: any) {
//       window.cdShell?.notify?.error(e.message || "Unexpected error");
//     } finally {
//       window.cdShell?.progress?.done();
//     }
//   }

//   setEnv(env: EnvConfig) {
//     this.env = env;
//   }

//   userDataResp(resp: ICdResponse) {
//     console.log("starting cdUiLib::UserService::userDataResp()");
//     if (resp) {
//       console.log("cdUiLib::UserService::init()/res:", resp);
//       // this.cd_token = resp.app_state.sess.cd_token;
//       this.cd_token = resp.app_state.sess!.cd_token;
//       // { name: 'Login/Register', picture: 'assets/cd/branding/coop/avatarCircle.svg' }
//       // this.currentUser = resp.data;
//       // this.currentUser.name = 'Login/Register';
//       if (resp.app_state.success) {
//         if ("userData" in resp.data) {
//           this.currentProfile.name = resp.data.userData.username;
//           this.currentUser = resp.data.userData.username;
//           this.cuid = resp.data.userData.user_id;
//           this.pals = resp.data.pals;
//           // this.currentUser.picture = 'assets/cd/branding/coop/avatarCircle.svg';
//           const avatarUrl = `${this.env.shellHost}/user-resources/${resp.data.userData.user_guid}/avatar-01/a.jpg`;
//           console.log("avatarUrl:", avatarUrl);
//           this.currentProfile.picture = avatarUrl;
//         }
//       }
//     }
//   }

//   // authObsv(authData: AuthData) {
//   //   console.log('authObsv(authData: AuthData)');
//   //   this.setEnvelopeAuth(authData);
//   //   /*
//   //   post login request to server
//   //   */
//   //   console.log('Submit()/this.postData:', JSON.stringify(this.postData))
//   //   return this.svServer.proc(this.postData);
//   // }

//   auth$(authData: IAuthData) {
//     console.log("auth$(authData: AuthData)");
//     delete authData.rememberMe;
//     this.setEnvelopeAuth(authData);
//     // console.log('Submit()/this.postData:', JSON.stringify(this.postData))
//     this.svServer.setEnv(this.env);
//     return this.svServer.proc(this.postData);
//   }

//   setEnvelopeAuth(authData: IAuthData) {
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "User",
//       a: "Login",
//       dat: {
//         f_vals: [
//           {
//             data: authData,
//           },
//         ],
//         token: null,
//       },
//       args: null,
//     };
//   }

//   // getUserData(loginResp: CdResponse) {
//   //   // console.log('starting UserService::getUserData()');
//   //   // console.log('UserService::getUserData()/loginResp:', loginResp);
//   //   this.setUserData(loginResp);
//   // }

//   configPushPayload(
//     triggerEvent: string,
//     emittEvent: string,
//     cuid: number | string
//   ): ICdPushEnvelop {
//     console.log("starting cdUiLib::UserService::configPushPayload()");
//     const pushEnvelope: ICdPushEnvelop = {
//       pushData: {
//         pushGuid: "",
//         m: "",
//         pushRecepients: [],
//         triggerEvent: "",
//         emittEvent: "",
//         token: "",
//         isNotification: null,
//         commTrack: {
//           initTime: Number(new Date()),
//           relayTime: null,
//           relayed: false,
//           pushed: false,
//           pushTime: null,
//           deliveryTime: null,
//           delivered: false,
//           completed: false,
//           completedTime: null,
//         },
//       },
//       req: null,
//       resp: null,
//     };

//     const users = [
//       {
//         userId: cuid,
//         subTypeId: 1,
//         cdObjId: {
//           appId: this.env.appId,
//           ngModule: "UserModule",
//           resourceName: "SessionService",
//           resourceGuid: uuidv4(),
//           jwtToken: "",
//           socket: null,
//           socketId: "",
//           commTrack: {
//             initTime: Number(new Date()),
//             relayTime: null,
//             relayed: false,
//             pushed: false,
//             pushTime: null,
//             deliveryTime: null,
//             delivered: false,
//             completed: false,
//             completedTime: null,
//           },
//         },
//       },
//       // {
//       //   userId: 1011,
//       //   subTypeId: 1,
//       //   cdObjId: {
//       //     appId: this.env.appId,
//       //     ngModule: 'UserModule',
//       //     resourceName: 'SessionService',
//       //     resourceGuid: uuidv4(),
//       //     jwtToken: '',
//       //     socket: null,
//       //     socketId: '',
//       //     commTrack: {
//       //       initTime: Number(new Date()),
//       //       relayTime: null,
//       //       relayed: false,
//       //       pushed: false,
//       //       pushTime: null,
//       //       deliveryTime: null,
//       //       delivered: false,
//       //       completed: false,
//       //       completedTime: null
//       //     },
//       //   },
//       // }
//     ];

//     const envl: ICdPushEnvelop = { ...pushEnvelope };
//     envl.pushData.triggerEvent = triggerEvent;
//     envl.pushData.emittEvent = emittEvent;

//     // set sender
//     const uSender: any = { ...users[0] };
//     uSender.subTypeId = 1;
//     envl.pushData.pushRecepients.push(uSender);

//     // set recepient
//     const uRecepient: any = { ...users[0] };
//     uRecepient.subTypeId = 7;
//     envl.pushData.pushRecepients.push(uRecepient);

//     console.log(
//       "starting cdUiLib::UserService::configPushPayload()/envl:",
//       envl
//     );

//     return envl;
//   }

//   setUserData(loginResp: any) {
//     this.svSio.initSio();
//     console.log("starting cdUiLib::UserService::setUserData(loginResp)");
//     console.log("cdUiLib::UserService::setUserData(res)/loginResp:", loginResp);
//     this.setEnvelopUserDataPost(loginResp);
//     // console.log('UserService::setUserData(res)/this.postData:', JSON.stringify(this.postData));
//     this.svServer.proc(this.postData).subscribe((loginResp: any) => {
//       // console.log('UserService::setUserData(res)/userDataResp:', userDataResp);
//       // this.svMenu.init(userDataResp);
//       this.userDataResp(loginResp);
//       // this.svNotif.init(userDataResp);
//       this.svAppState.setMode("anon");
//       // this.svMessages.init(userDataResp);
//       const loginData: ILoginData = loginResp["data"];
//       if (loginResp.app_state.success) {
//         this.env.consumer = loginData.consumer[0].consumerGuid;
//         // const cdEnvelop = { req: this.postData, resp: loginResp };

//         /**
//          * emittEvent is null because the purpose here is to
//          * register user socket on successfull login.
//          * At the time of this note, no broadcast event is set
//          */
//         // const pushEnvelop: ICdPushEnvelop = {
//         //   pushRecepients: null,
//         //   pushData: null,
//         //   emittEvent: null,
//         //   triggerEvent: 'login',
//         //   req: null,
//         //   resp: userDataResp
//         // };
//         // const pushEnvelop = this.configPushPayload('login', 'push-menu', loginData.userData.userId)
//         // this.emitLogin(pushEnvelop);
//         // this.svSio.sendPayLoad(pushEnvelop);
//       }
//     });
//   }

//   setEnvelopUserDataPost(loginResp: ICdResponse) {
//     // console.log('starting UserService::setUserDataPost()');
//     // console.log('setEnvelopUserDataPost/loginResp:', loginResp.app_state)
//     /*
//     set post data
//     */
//     this.postData = {
//       ctx: "Sys",
//       m: "Moduleman",
//       c: "ModulesController",
//       a: "GetModuleUserData",
//       dat: {
//         fields: null,
//         token: loginResp.app_state.sess!.cd_token,
//       },
//       args: null,
//     };
//   }

//   getUsersObsv(f: CdFilter[] | null) {
//     // console.log('starting getUsersObsv()');
//     this.setEnvelopeUsers(f);
//     // console.log('this.postData:', JSON.stringify(this.postData));
//     /*
//     post request to server and return observable
//     */
//     return this.svServer.proc(this.postData);
//   }

//   setEnvelopeUsers(f: CdFilter[] | null) {
//     let flt;
//     if (f) {
//       flt = [
//         {
//           filter: f,
//         },
//       ];
//     } else {
//       flt = null;
//     }
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "User",
//       a: "actionGet",
//       dat: {
//         f_vals: flt,
//         token: this.cd_token,
//       },
//       args: null,
//     };
//   }

//   registerUser(data: any) {
//     console.log(data);
//     console.log(data.is_sys_module);
//     this.setEnvelopeRegUser(data);
//     /*
//     post login request to server
//     */
//     this.svServer.proc(this.postData).subscribe((res: any) => {
//       console.log(res);
//       this.setRespRegUser(res.data);
//     });
//   }

//   /**
//    *
//    * @param data
//    * {
//           "ctx": "Sys",
//           "m": "Moduleman",
//           "c": "ModulesController",
//           "a": "actionRegisterModule",
//           "dat": {
//               "f_vals": [
//                   {
//                       "data": {
//                           "module_name": "FooModule",
//                           "is_sys_module": false,
//                           "module_type_id": 1
//                       }
//                   }
//               ],
//               "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
//           },
//           "args": null
//       }
//    */
//   setEnvelopeRegUser(regData: any) {
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "User",
//       a: "Register",
//       dat: {
//         f_vals: [
//           {
//             data: regData,
//             clientContext: this.env.clientContext,
//           },
//         ],
//         docproc: {},
//         token: this.svServer.token,
//       },
//       args: null,
//     };
//   }

//   activateUser$(activationData: any) {
//     console.log(activationData);
//     this.setEnvelopeActivateUser(activationData);
//     /*
//     post login request to server
//     */
//     return this.svServer.proc(this.postData);
//   }

//   /**
//    *
//    * @param data
//    * {
//           "ctx": "Sys",
//           "m": "User",
//           "c": "User",
//           "a": "ActivateUser",
//           "dat": {
//               "f_vals": [
//                   {
//                       "data": {
//                           "activationKey": "459bc3d0-c10e-4264-9e37-5175c379b620"
//                           "userId": 13,
//                           "sid": 23
//                       }
//                   }
//               ],
//               "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
//           },
//           "args": null
//       }
//    */
//   setEnvelopeActivateUser(activationData: any) {
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "User",
//       a: "ActivateUser",
//       dat: {
//         f_vals: [
//           {
//             query: { where: activationData[0] },
//             consumer: activationData[1],
//           },
//         ],
//         docproc: {},
//         token: this.svServer.token,
//       },
//       args: null,
//     };
//   }

//   setRespRegUser(data: any) {
//     console.log(data);
//   }

//   getAllUsers() {
//     this.setEnvelopeAllUsers();
//     /*
//     post login request to server
//     */
//     this.svServer.proc(this.postData).subscribe((res) => {
//       console.log("UserService::getAllUsers()/subscribe/res>>");
//       console.log(res);
//       this.setRespAllUsers(res);
//     });
//   }

//   /**
//    * {
//             "ctx": "Sys",
//             "m": "User",
//             "c": "UserController",
//             "a": "actionJoinGroup",
//             "dat": {
//                 "f_vals": [
//                     {
//                         "data": {
//                             "user_id": 1010,
//                             "group_guid_parent": "25E5D480-1F1E-166B-F1CD-0BA2BD86DC22"
//                         }
//                     }
//                 ],
//                 "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
//             },
//             "args": null
//         }
//    */
//   setEnvelopeAllUsers() {
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "User",
//       a: "actionGetAll",
//       dat: {
//         f_vals: [],
//         docproc: {},
//         token: this.svServer.token,
//       },
//       args: null,
//     };
//   }

//   getUser$(reqQuery: EnvelopFValItem, sid: string) {
//     this.setEnvelopeGetUser(reqQuery, sid);
//     return this.svServer.proc(this.postData);
//   }

//   /**
//    * ToDo: sort the token riddle...when being fetched for veryfying the user the 1st time
//    * During registration, the sid retrieved should be able to allow verification of user.
//    * At the moment a static one is used below. Not secure or tanable.
//    *
//    * {
//             "ctx": "Sys",
//             "m": "User",
//             "c": "UserController",
//             "a": "actionJoinGroup",
//             "dat": {
//                 "f_vals": [
//                     {
//                         "data": {
//                             "user_id": 1010,
//                             "group_guid_parent": "25E5D480-1F1E-166B-F1CD-0BA2BD86DC22"
//                         }
//                     }
//                 ],
//                 "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
//             },
//             "args": null
//         }
//    */
//   setEnvelopeGetUser(reqQuery: EnvelopFValItem, sid: string) {
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "User",
//       a: "GetCount",
//       dat: {
//         f_vals: [reqQuery],
//         token: sid,
//       },
//       args: {},
//     };
//   }
//   /**
//    * In the future, userId will be depricated.
//    * At the backend, userId will be derived from cdToken
//    * @param cdToken
//    * @param userId
//    * @returns
//    */
//   getUserProfile$(cdToken: string, userId?: number) {
//     this.setEnvelopeGetUserProfile(cdToken, userId);
//     return this.svServer.proc(this.postData);
//   }

//   /**
//    * ToDo: sort the token riddle...when being fetched for veryfying the user the 1st time
//    * During registration, the sid retrieved should be able to allow verification of user.
//    * At the moment a static one is used below. Not secure or tanable.
//    *
//    * {
//             "ctx": "Sys",
//             "m": "User",
//             "c": "User",
//             "a": "GetUserProfile",
//             "dat": {
//                 "f_vals": [
//                     {
//                         "data": {
//                             "userId": 1010
//                         }
//                     }
//                 ],
//                 "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
//             },
//             "args": null
//         }
//    */
//   setEnvelopeGetUserProfile(cdToken: string, userId?: number) {
//     /**
//      * In the future, userId will not be required but just the sid.
//      * At the backend userId will be derived using cdToken
//      */
//     if (!userId) {
//       userId = -1;
//     }
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "User",
//       a: "GetUserProfile",
//       dat: {
//         f_vals: [
//           {
//             data: {
//               userId: userId,
//             },
//           },
//         ],
//         token: cdToken,
//       },
//       args: {},
//     };
//   }

//   setRespAllUsers(res: any) {
//     console.log(res);
//     this.allUsers = res["data"];
//   }

//   emitLogin(cdEnvelop: ICdPushEnvelop) {
//     console.log("starting cdUiLib::UserService::emitLogin()");
//     // this.svSocket.emit('login', cdEnvelop);

//     cdEnvelop.pushData.triggerEvent = "login";
//     cdEnvelop.pushData.emittEvent = "push-menu";
//     this.svSio.sendPayLoad(cdEnvelop);
//   }

//   /**
//    * The above is to effect switching to default image when user has not
//    * set avatar.
//    * Desired method is to use a directive.
//    * Attempted sample: <project-dir>/src/app/pages/cd-palette/directives/default-image.directive.ts
//    */
//   getAvatar(User: any) {
//     let src;
//     if (User.done_avatar) {
//       src = `${this.env.USER_RESOURCES}/${User.user_guid}/avatar-01/a.jpg`;
//     } else {
//       src = `${this.env.USER_RESOURCES}/ooooooooo/avatar-01/a.jpg`;
//     }
//     return src;
//   }

//   /**
//    * get users registered under a given consumer
//    * For demo purpose, we are just pulling all the users
//    * However, yet to be implemented is registration of
//    * <consumer_guig>-users where all the registered users will be kept.
//    */
//   getConsumerUsersObsv() {
//     return this.getUsersObsv(null);
//   }

//   getGroupUsersObsv(groupGuidParent: any) {
//     this.setEnvelopeGetGroupUsers(groupGuidParent);
//     return this.svServer.proc(this.postData);
//   }
//   /**
//    * {
//           "ctx": "Sys",
//           "m": "User",
//           "c": "GroupMemberController",
//           "a": "actionGetGroupUsers",
//           "dat": {
//               "f_vals": [
//                   {
//                       "data": {
//                           "group_guid_parent": "08E30801-A7C0-E6A0-3FB1-394E7A71B456"
//                       }
//                   }
//               ],
//               "token": "15910E2B-5491-679D-3028-C99CE64CAC53"
//           },
//           "args": null
//       }
//    */
//   setEnvelopeGetGroupUsers(groupGuidParent: any) {
//     this.postData = {
//       ctx: "Sys",
//       m: "User",
//       c: "GroupMemberController",
//       a: "actionGetGroupUsers",
//       dat: {
//         f_vals: [
//           {
//             data: {
//               group_guid_parent: groupGuidParent,
//             },
//           },
//         ],
//         docproc: {},
//         token: this.svServer.token,
//       },
//       args: null,
//     };
//   }
// }

// src/CdApi/sys/user/services/user.service.ts
// src/CdShell/sys/cd-user/services/user.service.ts
import { CdFxReturn, ICdResponse } from "../../base/i-base";
import { HttpService } from "../../base/http.service";
import { EnvUserLogin, EnvUserProfile, UserModel } from "../models/user.model";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { LoggerService } from "../../../utils/logger.service";
import { inspect } from "util";
import { ConfigService } from "../../moduleman/services/config.service";

export class UserService {
  private http = new HttpService();
  private logger = new LoggerService();
  private cdToken = "";
  private svConfig: ConfigService;
  private cache: SysCacheService;

  constructor() {
    this.svConfig = new ConfigService();
    // this.cache = new SysCacheService(this.svConfig);
    this.cache = SysCacheService.getInstance(this.svConfig);
  }

  // ---------------------------------------------
  // Token handling (mirrors ModuleRegisterService)
  // ---------------------------------------------
  setCdToken(token: string): this {
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
  async login(
    user: UserModel,
    consumerGuid: string
  ): Promise<CdFxReturn<ICdResponse>> {
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
    } catch (err: any) {
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
  async loginAnonUser(
    consumerGuid: string
  ): Promise<CdFxReturn<ICdResponse> | null> {
    this.logger.debug("[UserService.loginAnonUser] Performing anon login");
    this.logger.debug("[UserService.loginAnonUser] consumerGuid", consumerGuid);

    if (!consumerGuid) {
      this.logger.warn(
        "[UserService.loginAnonUser] No consumerGuid → skipping anon login"
      );
      return null;
    }

    const anonUser: UserModel = {
      userName: "anon",
      password: "-",
    };

    const fx = await this.login(anonUser, consumerGuid);

    this.logger.debug("[UserService.loginAnonUser] fx:", fx);

    if (!fx?.state || !fx.data) {
      this.logger.warn(
        "[UserService.loginAnonUser] anon login failed → continuing with static shell config"
      );
      return fx;
    }

    this.logger.debug("[UserService.loginAnonUser] anon login success");
    return fx;
  }

  // ---------------------------------------------
  // Fetch user profile
  // ---------------------------------------------
  async getUserProfile(userId: number): Promise<ICdResponse> {
    const consumerGuid = this.cache.getConsumerGuid();
    if (!consumerGuid) {
      throw new Error("consumerGuid missing in SysCacheService");
    }

    EnvUserProfile.dat.f_vals[0].data.userId = userId;
    EnvUserProfile.dat.f_vals[0].data.consumerGuid = consumerGuid;
    EnvUserProfile.dat.token = this.cdToken;

    this.logger.debug(
      "[UserService] EnvUserProfile",
      inspect(EnvUserProfile, { depth: 4 })
    );

    const fx = await this.http.proc(EnvUserProfile, "cdApiLocal");

    if (!fx.state || !fx.data) {
      throw new Error(`Profile request failed: ${fx.message}`);
    }

    return fx.data;
  }

  async getUserByID(userId: number): Promise<ICdResponse> {
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

    this.logger.debug(
      "[UserService] getUserByID request",
      inspect(req, { depth: 4 })
    );

    const fx = await this.http.proc(req, "cdApiLocal");

    if (!fx.state || !fx.data) {
      throw new Error(`GetByID request failed: ${fx.message}`);
    }

    return fx.data;
  }

  async existingUserProfile(userId: number): Promise<boolean> {
    try {
      const resp = await this.getUserProfile(userId);
      if (
        resp.app_state.success &&
        resp.data &&
        Array.isArray(resp.data) &&
        resp.data.length > 0
      ) {
        const profile = resp.data[0];
        return profile !== null && profile !== undefined;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `[UserService] existingUserProfile error: ${error.message}`
      );
      return false;
    }
  }
}
