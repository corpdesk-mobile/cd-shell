var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let ModuleModel = class ModuleModel {
    moduleId;
    moduleGuid;
    moduleName;
    moduleDescription;
    docId;
    moduleIsPublic;
    isSysModule;
    moduleEnabled;
    lastModificationDate;
    groupGuid;
    moduleTypeId;
    order;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'module_id',
    })
], ModuleModel.prototype, "moduleId", void 0);
__decorate([
    Column({
        name: 'module_guid',
        length: 36,
        default: uuidv4(),
    })
], ModuleModel.prototype, "moduleGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'module_name',
        length: 50,
        nullable: true,
    })
], ModuleModel.prototype, "moduleName", void 0);
__decorate([
    Column('varchar', {
        name: 'module_description',
        length: 50,
        nullable: true,
    })
], ModuleModel.prototype, "moduleDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    })
], ModuleModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'module_is_public',
        nullable: true,
    })
], ModuleModel.prototype, "moduleIsPublic", void 0);
__decorate([
    Column({
        name: 'is_sys_module',
        nullable: true,
    })
], ModuleModel.prototype, "isSysModule", void 0);
__decorate([
    Column({
        name: 'module_enabled',
        nullable: true,
    })
], ModuleModel.prototype, "moduleEnabled", void 0);
__decorate([
    Column('datetime', {
        name: 'last_modification_date',
        nullable: true,
    })
], ModuleModel.prototype, "lastModificationDate", void 0);
__decorate([
    Column({
        name: 'group_guid',
        length: 36,
        default: null,
    })
], ModuleModel.prototype, "groupGuid", void 0);
__decorate([
    Column({
        name: 'module_type_id',
        nullable: true,
    })
], ModuleModel.prototype, "moduleTypeId", void 0);
__decorate([
    Column({
        name: 'order',
        nullable: true,
    })
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
