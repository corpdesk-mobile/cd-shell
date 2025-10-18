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
let AclModel = class AclModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'acl_id',
    }),
    __metadata("design:type", Number)
], AclModel.prototype, "aclId", void 0);
__decorate([
    Column({
        name: 'acl_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], AclModel.prototype, "aclGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'acl_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], AclModel.prototype, "aclName", void 0);
__decorate([
    Column('char', {
        name: 'acl_type_guid',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], AclModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    Column('datetime', {
        name: 'last_sync_date',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "lastSyncDate", void 0);
__decorate([
    Column('datetime', {
        name: 'last_modification_date',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "lastModificationDate", void 0);
__decorate([
    Column({
        name: 'parent_module_guid',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "parentModuleGuid", void 0);
__decorate([
    Column({
        name: 'parent_class_guid',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "parentClassGuid", void 0);
__decorate([
    Column({
        name: 'parent_obj',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "parentObj", void 0);
__decorate([
    Column('datetime', {
        name: 'acl_disp_name',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "cdObjDispName", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", Number)
], AclModel.prototype, "docId", void 0);
__decorate([
    Column('bit', {
        name: 'show_name',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", Boolean)
], AclModel.prototype, "showName", void 0);
__decorate([
    Column('varchar', {
        name: 'icon',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "icon", void 0);
__decorate([
    Column('bit', {
        name: 'show_icon',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", Boolean)
], AclModel.prototype, "showIcon", void 0);
__decorate([
    Column('varchar', {
        name: 'curr_val',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], AclModel.prototype, "currVal", void 0);
__decorate([
    Column('bit', {
        name: 'enabled',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", Boolean)
], AclModel.prototype, "enabled", void 0);
AclModel = __decorate([
    Entity({
        name: 'acl',
        synchronize: false,
    })
    // @CdModel
], AclModel);
export { AclModel };
