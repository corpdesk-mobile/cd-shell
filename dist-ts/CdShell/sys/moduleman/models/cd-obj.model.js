var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';
export const defaultCdObjEnv = {
    ctx: 'Sys',
    m: 'Moduleman',
    c: 'CdObj',
    a: '',
    dat: {
        f_vals: [],
        token: '',
    },
    args: {},
};
let CdObjModel = class CdObjModel {
    // b?: BaseService;
    cdObjId;
    cdObjGuid;
    cdObjName;
    cdObjTypeGuid;
    // @IsInt()
    lastSyncDate;
    // @IsInt()
    lastModificationDate;
    parentModuleGuid;
    parentModuleId;
    // @IsInt()
    parentClassGuid;
    // @IsInt()
    parentObj;
    // @IsInt()
    cdObjDispName;
    objId;
    objGuid;
    docId;
    // @IsInt()
    showName;
    icon;
    showIcon;
    currVal;
    cdObjEnabled;
    jDetails;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_obj_id',
    })
], CdObjModel.prototype, "cdObjId", void 0);
__decorate([
    Column({
        name: 'cd_obj_guid',
        length: 36,
    })
], CdObjModel.prototype, "cdObjGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_obj_name',
        length: 50,
        nullable: true,
    })
], CdObjModel.prototype, "cdObjName", void 0);
__decorate([
    Column('char', {
        name: 'cd_obj_type_guid',
        length: 60,
        default: null,
    })
], CdObjModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    Column('datetime', {
        name: 'last_sync_date',
        default: null,
    })
    // @IsInt()
], CdObjModel.prototype, "lastSyncDate", void 0);
__decorate([
    Column('datetime', {
        name: 'last_modification_date',
        default: null,
    })
    // @IsInt()
], CdObjModel.prototype, "lastModificationDate", void 0);
__decorate([
    Column({
        name: 'parent_module_guid',
        default: null,
    })
], CdObjModel.prototype, "parentModuleGuid", void 0);
__decorate([
    Column({
        name: 'parent_module_id',
        default: null,
    })
], CdObjModel.prototype, "parentModuleId", void 0);
__decorate([
    Column({
        name: 'parent_class_guid',
        default: null,
    })
    // @IsInt()
], CdObjModel.prototype, "parentClassGuid", void 0);
__decorate([
    Column({
        name: 'parent_obj',
        default: null,
    })
    // @IsInt()
], CdObjModel.prototype, "parentObj", void 0);
__decorate([
    Column('datetime', {
        name: 'cd_obj_disp_name',
        default: null,
    })
    // @IsInt()
], CdObjModel.prototype, "cdObjDispName", void 0);
__decorate([
    Column({
        name: 'obj_id',
        default: null,
    })
], CdObjModel.prototype, "objId", void 0);
__decorate([
    Column({
        name: 'obj_guid',
        default: null,
    })
], CdObjModel.prototype, "objGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CdObjModel.prototype, "docId", void 0);
__decorate([
    Column('bit', {
        name: 'show_name',
        default: null,
    })
    // @IsInt()
], CdObjModel.prototype, "showName", void 0);
__decorate([
    Column('varchar', {
        name: 'icon',
        default: null,
    })
], CdObjModel.prototype, "icon", void 0);
__decorate([
    Column('bit', {
        name: 'show_icon',
        default: null,
    })
], CdObjModel.prototype, "showIcon", void 0);
__decorate([
    Column('varchar', {
        name: 'curr_val',
        default: null,
    })
], CdObjModel.prototype, "currVal", void 0);
__decorate([
    Column('bit', {
        name: 'cd_obj_enabled',
        default: null,
    })
], CdObjModel.prototype, "cdObjEnabled", void 0);
__decorate([
    Column({
        name: 'j_details',
        default: null,
    })
], CdObjModel.prototype, "jDetails", void 0);
CdObjModel = __decorate([
    Entity({
        name: 'cd_obj',
        synchronize: false,
    })
    // @CdModel
], CdObjModel);
export { CdObjModel };
