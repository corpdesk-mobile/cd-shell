var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DEFAULT_ARGS, DEFAULT_DAT, SYS_CTX } from '../../base/i-base.js';
DEFAULT_DAT.f_vals[0].data = {
    userName: '',
    password: '',
};
export const DEFAULT_ENVELOPE_LOGIN = {
    ctx: SYS_CTX,
    m: 'User',
    c: 'User',
    a: 'Login',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
// user.controller.ts
// export const LOGIN_CMD = {
//   name: 'login',
//   description: 'Log in to the system.',
//   options: [
//     { flags: '-u, --user <username>', description: 'Username' },
//     { flags: '-p, --password <password>', description: 'Password' },
//   ],
//   action: {
//     execute: async (options: any) => {
//       const userController = new UserController();
//       const { user, password } = options;
//       await userController.auth(user, password); // Password is now optional
//     },
//   },
// };
// export const LOGOUT_CMD = {
//   name: 'logout',
//   description: 'Log out from the system.',
//   action: {
//     execute: () => {
//       const userController = new UserController();
//       userController.logout();
//     },
//   },
// };
//////////////////////////////////////////////////////
let UserModel = class UserModel {
    userId;
    userGuid;
    userName;
    password;
    email;
    // @IsInt()
    companyId;
    // @IsInt()
    docId;
    mobile;
    gender;
    // @IsDate()
    birthDate;
    postalAddr;
    fName;
    mName;
    lName;
    // @IsInt()
    nationalId;
    // @IsInt()
    passportId;
    userEnabled;
    zipCode;
    activationKey;
    userTypeId;
    userProfile;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'user_id',
    })
], UserModel.prototype, "userId", void 0);
__decorate([
    Column({
        name: 'user_guid',
        length: 36,
    })
], UserModel.prototype, "userGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'user_name',
        length: 50,
        nullable: true,
    })
], UserModel.prototype, "userName", void 0);
__decorate([
    Column('char', {
        name: 'password',
        length: 60,
        default: null,
    })
], UserModel.prototype, "password", void 0);
__decorate([
    Column('varchar', {
        length: 60,
        unique: true,
        nullable: true,
    }),
    Column()
], UserModel.prototype, "email", void 0);
__decorate([
    Column({
        name: 'company_id',
        default: null,
    })
    // @IsInt()
], UserModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
    // @IsInt()
], UserModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'mobile',
        default: null,
    })
], UserModel.prototype, "mobile", void 0);
__decorate([
    Column({
        name: 'gender',
        default: null,
    })
], UserModel.prototype, "gender", void 0);
__decorate([
    Column({
        name: 'birth_date',
        default: null,
    })
    // @IsDate()
], UserModel.prototype, "birthDate", void 0);
__decorate([
    Column({
        name: 'postal_addr',
        default: null,
    })
], UserModel.prototype, "postalAddr", void 0);
__decorate([
    Column({
        name: 'f_name',
        default: null,
    })
], UserModel.prototype, "fName", void 0);
__decorate([
    Column({
        name: 'm_name',
        default: null,
    })
], UserModel.prototype, "mName", void 0);
__decorate([
    Column({
        name: 'l_name',
        default: null,
    })
], UserModel.prototype, "lName", void 0);
__decorate([
    Column({
        name: 'national_id',
        default: null,
    })
    // @IsInt()
], UserModel.prototype, "nationalId", void 0);
__decorate([
    Column({
        name: 'passport_id',
        default: null,
    })
    // @IsInt()
], UserModel.prototype, "passportId", void 0);
__decorate([
    Column({
        name: 'user_enabled',
        default: null,
    })
], UserModel.prototype, "userEnabled", void 0);
__decorate([
    Column('char', {
        name: 'zip_code',
        length: 5,
        default: null,
    })
], UserModel.prototype, "zipCode", void 0);
__decorate([
    Column({
        name: 'activation_key',
        length: 36,
    })
], UserModel.prototype, "activationKey", void 0);
__decorate([
    Column({
        name: 'user_type_id',
        default: null,
    })
], UserModel.prototype, "userTypeId", void 0);
__decorate([
    Column({
        name: 'user_profile',
        default: null,
    })
], UserModel.prototype, "userProfile", void 0);
UserModel = __decorate([
    Entity({
        name: 'user',
        synchronize: false,
    })
], UserModel);
export { UserModel };
export const profileDefaultConfig = [
    {
        path: ['fieldPermissions', 'userPermissions', ['userName']],
        value: {
            userId: 1000,
            field: 'userName',
            hidden: false,
            read: true,
            write: false,
            execute: false,
        },
    },
    {
        path: ['fieldPermissions', 'groupPermissions', ['userName']],
        value: {
            groupId: 0,
            field: 'userName',
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
    fieldPermissions: {
        /**
         * specified permission setting for given users to specified fields
         */
        userPermissions: [
            {
                userId: 1000,
                field: 'userName',
                hidden: false,
                read: true,
                write: false,
                execute: false,
            },
        ],
        groupPermissions: [
            {
                groupId: 0, // "_public"
                field: 'userName',
                hidden: false,
                read: true,
                write: false,
                execute: false,
            },
        ],
    },
    userData: {
        userName: '',
        fName: '',
        lName: '',
    },
};
function uuidv4() {
    throw new Error('Function not implemented.');
}
