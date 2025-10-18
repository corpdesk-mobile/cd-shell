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
let MenuModel = class MenuModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'menu_id',
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "menuId", void 0);
__decorate([
    Column({
        name: 'menu_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "menuGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "menuName", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_description',
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "menuDescription", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_closet_file',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "menuClosetFile", void 0);
__decorate([
    Column({
        name: 'menu_action_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "menuActionId", void 0);
__decorate([
    Column({
        name: 'cd_obj_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "cdObjId", void 0);
__decorate([
    Column({
        name: 'menu_enabled',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], MenuModel.prototype, "menuEnabled", void 0);
__decorate([
    Column({
        name: 'menu_parent_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "menuParentId", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'module_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "moduleId", void 0);
__decorate([
    Column({
        name: 'menu_order',
        nullable: true,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "menuOrder", void 0);
__decorate([
    Column('varchar', {
        name: 'path',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "path", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_description',
        length: 300,
        nullable: true,
    }),
    Column('varchar', {
        name: 'menu_lable',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "menuLable", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_icon',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "menuIcon", void 0);
__decorate([
    Column({
        name: 'icon_type',
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "iconType", void 0);
__decorate([
    Column({
        name: 'group',
        nullable: true,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "group", void 0);
__decorate([
    Column({
        name: 'is_title',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], MenuModel.prototype, "isTitle", void 0);
__decorate([
    Column({
        name: 'badge',
        nullable: true,
    }),
    __metadata("design:type", String)
], MenuModel.prototype, "badge", void 0);
__decorate([
    Column({
        name: 'is_layout',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], MenuModel.prototype, "isLayout", void 0);
__decorate([
    Column({
        name: 'menu_is_public',
        type: 'tinyint',
        width: 1,
        default: 0,
    }),
    __metadata("design:type", Number)
], MenuModel.prototype, "menuIsPublic", void 0);
MenuModel = __decorate([
    Entity({
        name: 'menu',
        synchronize: false,
    })
    // @CdModel
], MenuModel);
export { MenuModel };
