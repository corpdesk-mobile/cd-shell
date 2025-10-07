var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let AclModel = class AclModel {
    aclId;
    aclGuid;
    aclName;
    cdObjTypeGuid;
    // @IsInt()
    lastSyncDate;
    // @IsInt()
    lastModificationDate;
    // @IsInt()
    parentModuleGuid;
    // @IsInt()
    parentClassGuid;
    // @IsInt()
    parentObj;
    // @IsInt()
    cdObjDispName;
    // @IsInt()
    docId;
    // @IsInt()
    showName;
    // @IsInt()
    icon;
    // @IsInt()
    showIcon;
    // @IsInt()
    currVal;
    // @IsInt()
    enabled;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'acl_id',
    })
], AclModel.prototype, "aclId", void 0);
__decorate([
    Column({
        name: 'acl_guid',
        length: 36,
        default: uuidv4(),
    })
], AclModel.prototype, "aclGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'acl_name',
        length: 50,
        nullable: true,
    })
], AclModel.prototype, "aclName", void 0);
__decorate([
    Column('char', {
        name: 'acl_type_guid',
        length: 60,
        default: null,
    })
], AclModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    Column('datetime', {
        name: 'last_sync_date',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "lastSyncDate", void 0);
__decorate([
    Column('datetime', {
        name: 'last_modification_date',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "lastModificationDate", void 0);
__decorate([
    Column({
        name: 'parent_module_guid',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "parentModuleGuid", void 0);
__decorate([
    Column({
        name: 'parent_class_guid',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "parentClassGuid", void 0);
__decorate([
    Column({
        name: 'parent_obj',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "parentObj", void 0);
__decorate([
    Column('datetime', {
        name: 'acl_disp_name',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "cdObjDispName", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "docId", void 0);
__decorate([
    Column('bit', {
        name: 'show_name',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "showName", void 0);
__decorate([
    Column('varchar', {
        name: 'icon',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "icon", void 0);
__decorate([
    Column('bit', {
        name: 'show_icon',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "showIcon", void 0);
__decorate([
    Column('varchar', {
        name: 'curr_val',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "currVal", void 0);
__decorate([
    Column('bit', {
        name: 'enabled',
        default: null,
    })
    // @IsInt()
], AclModel.prototype, "enabled", void 0);
AclModel = __decorate([
    Entity({
        name: 'acl',
        synchronize: false,
    })
    // @CdModel
], AclModel);
export { AclModel };
