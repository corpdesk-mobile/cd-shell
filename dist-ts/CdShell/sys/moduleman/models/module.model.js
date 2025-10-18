var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from 'uuid';
let ModuleModel = class ModuleModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'module_id',
    }),
    __metadata("design:type", Number)
], ModuleModel.prototype, "moduleId", void 0);
__decorate([
    Column({
        name: 'module_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], ModuleModel.prototype, "moduleGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'module_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], ModuleModel.prototype, "moduleName", void 0);
__decorate([
    Column('varchar', {
        name: 'module_description',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], ModuleModel.prototype, "moduleDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], ModuleModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'module_is_public',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], ModuleModel.prototype, "moduleIsPublic", void 0);
__decorate([
    Column({
        name: 'is_sys_module',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], ModuleModel.prototype, "isSysModule", void 0);
__decorate([
    Column({
        name: 'module_enabled',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], ModuleModel.prototype, "moduleEnabled", void 0);
__decorate([
    Column('datetime', {
        name: 'last_modification_date',
        nullable: true,
    }),
    __metadata("design:type", String)
], ModuleModel.prototype, "lastModificationDate", void 0);
__decorate([
    Column({
        name: 'group_guid',
        length: 36,
        default: null,
    }),
    __metadata("design:type", String)
], ModuleModel.prototype, "groupGuid", void 0);
__decorate([
    Column({
        name: 'module_type_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], ModuleModel.prototype, "moduleTypeId", void 0);
__decorate([
    Column({
        name: 'order',
        nullable: true,
    }),
    __metadata("design:type", Number)
], ModuleModel.prototype, "order", void 0);
ModuleModel = __decorate([
    Entity({
        name: 'module',
        synchronize: false,
    })
], ModuleModel);
export { ModuleModel };
export const EnvCreate = {
    ctx: 'Sys',
    m: 'Moduleman',
    c: 'Module',
    a: 'Create',
    dat: {
        token: '',
        f_vals: [
            {
                data: {
                    moduleName: '',
                    isSysModule: false,
                },
                cdObj: {
                    cdObjName: '',
                    cdObjTypeGuid: '809a6e31-9fb1-4874-b61a-38cf2708a3bb',
                    parentModuleGuid: '04060dfa-fc94-4e3a-98bc-9fbd739deb87',
                },
            },
        ],
    },
    args: null,
};
export const EnvPurge = {
    ctx: 'Sys',
    m: 'Moduleman',
    c: 'Module',
    a: 'PurgeModule',
    dat: {
        token: '',
        f_vals: [
            {
                data: {
                    moduleName: '',
                },
            },
        ],
    },
    args: null,
};
