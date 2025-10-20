// import { SqliteStore } from "../store/SqliteStore";
// import { UserModel } from "../entities/UserModel";

import { ObjectLiteral } from 'typeorm';
import {
  CD_FX_FAIL,
  CdFxReturn,
  IQuery,
  IServiceInput,
} from '../../base/i-base.js';
import { DocModel } from '../../moduleman/models/doc.model.js';
import { UserModel } from '../models/user.model.js';
import CdLog from '../../cd-comm/controllers/cd-logger.controller.js';
// import { BaseService } from '../../base/base.service.js';
import config from '../../../../config.js';
import { GenericService } from '../../base/generic-service.js';

// import { ProfileServiceHelper } from '../../utils/profile-service-helper.js';

export class UserService extends GenericService<UserModel> {
  // b = new BaseService<UserModel>();

  // defaultDs = config.ds.sqlite;
  // Define validation rules
  cRules: any = {
    required: ['userName', 'email', 'password'],
    noDuplicate: ['userName', 'email'],
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ADAPTATION FROM GENERIC SERVICE
  constructor() {
    super();
  }

  /**
   * Validate input before processing create
   */
  async validateCreate(pl: UserModel): Promise<CdFxReturn<boolean>> {
    const retState = true;
    // Ensure required fields exist
    for (const field of this.cRules.required) {
      if (!pl[field]) {
        return {
          data: false,
          state: false,
          message: `Missing required field: ${field}`,
        };
      }
    }

    // Check for duplicates
    const query = {
      where: {
        userName: pl.userName,
        email: pl.email,
      },
    };
    const serviceInput: IServiceInput<UserModel> = {
      serviceModel: UserModel,
      docName: 'Validate Duplicate User',
      dSource: 1,
      cmd: { query },
    };

    const existingRecords = await this.b.read(null, null, serviceInput);
    if ('state' in existingRecords && 'data' in existingRecords) {
      if (!existingRecords.state || !existingRecords.data) {
        return { data: false, state: false, message: 'Validation failed' };
      }

      if (existingRecords.data.length > 0) {
        return { data: true, state: true, message: 'Validation passed' };
      } else {
        return { data: false, state: false, message: 'Validation failed' };
      }
    }

    return { data: false, state: false, message: 'Validation failed' };
  }

  /**
   * Fetch newly created record by guid
   */
  async afterCreate(
    pl: UserModel,
  ): Promise<CdFxReturn<UserModel | ObjectLiteral | null >> {
    const query = {
      where: { userGuid: pl.userGuid },
    };

    const serviceInput = {
      serviceModel: UserModel,
      docName: 'Fetch Created User',
      dSource: 1,
      cmd: { query },
    };

    const retResult = await this.b.read(null, null, serviceInput);
    if ('state' in retResult) {
      return retResult;
    } else {
      return CD_FX_FAIL;
    }
  }

  async getUser(
    q: IQuery,
  ): Promise<CdFxReturn<UserModel[] | ObjectLiteral[] | unknown>> {
    // Validate query input
    if (!q || !q.where || Object.keys(q.where).length === 0) {
      return {
        data: null,
        state: false,
        message: 'Invalid query: "where" condition is required',
      };
    }

    const serviceInput = {
      serviceModel: UserModel,
      docName: 'UserService::getUser',
      cmd: {
        action: 'find',
        query: q,
      },
      dSource: 1,
    };

    try {
      const retResult = await this.b.read(null, null, serviceInput);

      if ('state' in retResult) {
        return retResult;
      } else {
        return CD_FX_FAIL;
      }
    } catch (e: any) {
      CdLog.error(`UserService.getUser() - Error: ${e.message}`);
      return {
        data: null,
        state: false,
        message: `Error retrieving User: ${e.message}`,
      };
    }
  }

  beforeUpdate(q: any) {
    if (q.update.CoopEnabled === '') {
      q.update.CoopEnabled = null;
    }
    return q;
  }

  async getUserByID(req, res, uid) {
    const serviceInput = {
      serviceInstance: this,
      serviceModel: UserModel,
      docModel: DocModel,
      docName: 'UserService::getUserByID',
      cmd: {
        action: 'find',
        query: { where: { userId: uid } },
      },
      dSource: 1,
    };
    return await this.b.read(req, res, serviceInput);
  }

  async existingUserProfile(req, res, cuid) {
    const si: IServiceInput<UserModel> = {
      serviceInstance: this,
      serviceModel: UserModel,
      docName: 'UserService::existingUserProfile',
      cmd: {
        query: { where: { userId: cuid } },
      },
      mapping: { profileField: 'userProfile' },
    };
    return ``
  }

  async modifyProfile(existingData, profileConfig) {
    return await {}
  }

  // Helper method to validate profile data
  async validateProfileData(req, res, profileData: any): Promise<boolean> {
    CdLog.debug('UserService::validateProfileData()/profileData:', profileData);
    // const profileData: IUserProfile = updateData.update.userProfile
    // CdLog.debug("UserService::validateProfileData()/profileData:", profileData)
    // Check if profileData is null or undefined
    if (!profileData) {
      CdLog.debug('UserService::validateProfileData()/01');
      return false;
    }

    // Validate that the required fields of IUserProfile exist
    if (!profileData.fieldPermissions || !profileData.userData) {
      CdLog.debug('UserService::validateProfileData()/02');
      return false;
    }

    // Example validation for bio length
    if (profileData.bio && profileData.bio.length > 500) {
      CdLog.debug('UserService::validateProfileData()/03');
      const e = 'Bio data is too long';
      this.b.err.push(e);
      const i = {
        messages: this.b.err,
        code: 'UserService:validateProfileData',
        app_msg: '',
      };
      await this.b.serviceErr(req, res, e, i.code);
      return false; // Bio is too long
    }
    return true;
  }

  // login(fg: any) {
  //   console.info("starting cd-user/LoginComponent::login");
  //   let authData: AuthData = fg.value;
  //   const valid = fg.valid;
  //   console.info("cd-user/LoginComponent::login/01");
  //   console.info("cd-user/LoginComponent::login/fg:", fg);
  //   console.info("cd-user/LoginComponent::login/valid:", valid);
  //   this.submitted = true;
  //   const consumerGuid = { consumerGuid: environment.consumerToken };
  //   authData = Object.assign({}, authData, consumerGuid); // merge data with consumer object
  //   try {
  //     console.info("cd-user/LoginComponent::login/02");
  //     if (valid) {
  //       console.info("cd-user/LoginComponent::login/03");
  //       this.initSession(authData);
  //     }
  //   } catch (err) {
  //     console.info("cd-user/LoginComponent::login/04");
  //     this.errMsg = "Something went wrong!!";
  //     this.loginInvalid = true;
  //   }
  // }

  // /**
  //  * Following login request to cd-api server, this method is called to
  //  * 1. Create a session via svSess.createSess()
  //  * 2. Save current user data in svUser.currentUser
  //  * 3. Set user menu in svNav.userMenu
  //  * 4. Notify cd-shell/SidbarComponent of login status while availing menu data to cd-shell/SidebarComponent via cd-sio server
  //  * 5. Navigate to the initial page defined in environment.initialPage
  //  * @param authData 
  //  */
  // initSession(authData: AuthData) {
  //   console.info("cd-user/LoginComponent::initSession/01");
  //   this.svUser.auth$(authData).subscribe((res: any) => {
  //     if (res.app_state.success === true) {
  //       console.info(
  //         "cd-user/LoginComponent::initSession/res:",
  //         JSON.stringify(res)
  //       );
  //       this.svSess.appState = res.app_state;
  //       /*
  //       create a session on successfull authentication.
  //       For subsequeng successull request to the server,
  //       use renewSess(res);
  //       */
  //       if (res.app_state.sess.cd_token !== null && res.app_state.success) {
  //         console.info("cd-user/LoginComponent::initSession/02");

  //         /**
  //          * Prepare the push payload to send menu data to cd-shell/SidebarComponent
  //          */
  //         const envl: ICdPushEnvelop = this.configPushPayload(
  //           "login",
  //           "push-menu",
  //           res.data.userData.userId
  //         );
  //         envl.pushData.m = res.data.menuData;
  //         envl.pushData.token = res.app_state.sess.cd_token;
  //         console.info("cd-user/LoginComponent::initSession/envl:", envl);

  //         /**
  //          * Send the menu data to cd-shell/SidebarComponent via the cd-sio server
  //          */
  //         if (environment.wsMode === "sio") {
  //           console.info(
  //             "cd-user/LoginComponent::initSession/envl:...using sio"
  //           );
  //           this.sendSioMessage(envl);
  //         }

  //         /**
  //          * If environment.wsMode is set to wss, then use the WebSocketService to send the menu data to cd-shell/SidebarComponent via the cd-sio server
  //          */
  //         if (environment.wsMode === "wss") {
  //           console.info(
  //             "cd-user/LoginComponent::initSession/envl:...using wss"
  //           );
  //           this.svWss.sendMsg(envl);
  //         }

  //         ///////////////////////////////////////
  //         this.svSess.createSess(res, this.svMenu);
  //         this.svUser.currentUser = {
  //           name: `${res.data.userData.userName}`,
  //           picture: `${environment.shellHost}/user-resources/${res.data.userData.userGuid}/avatar-01/a.jpg`,
  //         };
  //         this.svNav.userMenu = [
  //           { title: "Profile", link: "/pages/cd-auth/register" },
  //           { title: "Log out", link: "/pages/cd-auth/logout" },
  //         ];
  //         // this.baseModel.sess = res.app_state.sess;
  //         const params = {
  //           queryParams: { token: res.app_state.sess.cd_token },
  //           skipLocationChange: true,
  //           replaceUrl: false,
  //         };
  //         // below: old method
  //         // this.route.navigate(['/comm'], params);
  //         // this.route.navigate(['/dashboard'], params);
  //         this.route.navigate([environment.initialPage], params);

  //         // below new method based on this.baseModel;
  //         // this.svNav.nsNavigate(this,'/comm','message from cd-user')
  //       }
  //     } else {
  //       this.errMsg = "The userName and password were not valid";
  //       this.loginInvalid = true;
  //       this.svSess.logout();
  //     }
  //   });
  // }

  
}
