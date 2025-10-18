// import type { ICdRequest } from '../../base/i-base.js';
// import { DEFAULT_ARGS, DEFAULT_DAT, SYS_CTX } from '../../base/i-base.js';
// // import { UserController } from '../controllers/user.controller.js';
// import { BaseService } from '../../base/base.service.js';
// import { UserController } from '../controllers/user.controller.js';
// import { Entity, Column, PrimaryGeneratedColumn } from '../../utils/orm-shim.js';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DEFAULT_ARGS, DEFAULT_DAT, SYS_CTX } from '../../base/i-base.js';
// import { Entity, Column, PrimaryGeneratedColumn } from '../../utils/orm-shim.js';
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
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
let UserModel = class UserModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'user_id',
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "userId", void 0);
__decorate([
    Column({
        name: 'user_guid',
        length: 36,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "userGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'user_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "userName", void 0);
__decorate([
    Column('char', {
        name: 'password',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "password", void 0);
__decorate([
    Column('varchar', {
        length: 60,
        unique: true,
        nullable: true,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "email", void 0);
__decorate([
    Column({
        name: 'company_id',
        default: null,
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'mobile',
        default: null,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "mobile", void 0);
__decorate([
    Column({
        name: 'gender',
        default: null,
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "gender", void 0);
__decorate([
    Column({
        name: 'birth_date',
        default: null,
    }),
    __metadata("design:type", Date)
], UserModel.prototype, "birthDate", void 0);
__decorate([
    Column({
        name: 'postal_addr',
        default: null,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "postalAddr", void 0);
__decorate([
    Column({
        name: 'f_name',
        default: null,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "fName", void 0);
__decorate([
    Column({
        name: 'm_name',
        default: null,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "mName", void 0);
__decorate([
    Column({
        name: 'l_name',
        default: null,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "lName", void 0);
__decorate([
    Column({
        name: 'national_id',
        default: null,
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "nationalId", void 0);
__decorate([
    Column({
        name: 'passport_id',
        default: null,
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "passportId", void 0);
__decorate([
    Column({
        name: 'user_enabled',
        default: null,
    }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "userEnabled", void 0);
__decorate([
    Column('char', {
        name: 'zip_code',
        length: 5,
        default: null,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "zipCode", void 0);
__decorate([
    Column({
        name: 'activation_key',
        length: 36,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "activationKey", void 0);
__decorate([
    Column({
        name: 'user_type_id',
        default: null,
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "userTypeId", void 0);
__decorate([
    Column({
        name: 'user_profile',
        default: null,
    }),
    __metadata("design:type", String)
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
export const userProfileDefault = {
    fieldPermissions: {
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
                groupId: 0,
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
