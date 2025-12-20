// import type { ICdRequest } from '../../base/i-base.js';
// import { DEFAULT_ARGS, DEFAULT_DAT, SYS_CTX } from '../../base/i-base.js';
// import { BaseService } from '../../base/base.service.js';
// import { UserController } from '../controllers/user.controller.js';
// // import { Entity, Column, PrimaryGeneratedColumn } from '../../utils/orm-shim.js';
// import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "../../../sys/utils/orm-shim";
import { validateOrReject, } from "class-validator";
import config from "../../../../config";
// @Entity({
//   name: "user",
//   synchronize: false,
// })
// @CdModel
export class UserModel {
    // HOOKS
    // @BeforeInsert()
    // @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}
export const profileDefaultConfig = [
    {
        path: ["fieldPermissions", "userPermissions", ["userName"]],
        value: {
            userId: 1000,
            field: "userName",
            hidden: false,
            read: true,
            write: false,
            execute: false,
        },
    },
    {
        path: ["fieldPermissions", "groupPermissions", ["userName"]],
        value: {
            groupId: 0,
            field: "userName",
            hidden: false,
            read: true,
            write: false,
            execute: false,
        },
    },
];
/**
 * the data below can be managed under with 'roles'
 * there needs to be a function that set the default 'role' for a user
 */
export const userProfileDefault = {
    avatar: {
        url: `https://${config.profiles.cdApiLocal.hostName}/assets/images/users/avatar-anon.jpg`,
    },
    fieldPermissions: {
        /**
         * specified permission setting for given users to specified fields
         */
        userPermissions: [
            {
                userId: 1000,
                field: "userName",
                hidden: false,
                read: true,
                write: false,
                execute: false,
            },
        ],
        groupPermissions: [
            {
                groupId: 0, // "_public"
                field: "userName",
                hidden: false,
                read: true,
                write: false,
                execute: false,
            },
        ],
    },
    userData: {
        userName: "",
        fName: "",
        lName: "",
    },
};
export const EnvUserLogin = {
    ctx: 'Sys',
    m: 'User',
    c: 'User',
    a: 'Login',
    dat: {
        token: null,
        f_vals: [
            {
                data: {
                    userName: '',
                    password: '',
                    consumerGuid: '',
                },
            },
        ],
    },
    args: null,
};
export const EnvUserProfile = {
    ctx: 'Sys',
    m: 'User',
    c: 'User',
    a: 'GetUserProfile',
    dat: {
        token: null,
        f_vals: [
            {
                data: {
                    userId: -1,
                    consumerGuid: '',
                },
            },
        ],
    },
    args: null,
};
