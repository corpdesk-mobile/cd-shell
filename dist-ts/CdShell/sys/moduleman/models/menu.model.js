var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let MenuModel = class MenuModel {
    menuId;
    menuGuid;
    menuName;
    menuDescription;
    menuClosetFile;
    menuActionId;
    cdObjId;
    menuEnabled;
    menuParentId;
    docId;
    moduleId;
    menuOrder;
    path;
    menuLable;
    menuIcon;
    iconType;
    group;
    isTitle;
    badge;
    isLayout;
    // @Column(
    //     {
    //         name: 'menu_is_public',
    //         nullable: true
    //     }
    // )
    // menuIsPublic?: boolean | number;
    menuIsPublic;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'menu_id',
    })
], MenuModel.prototype, "menuId", void 0);
__decorate([
    Column({
        name: 'menu_guid',
        length: 36,
        default: uuidv4(),
    })
], MenuModel.prototype, "menuGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_name',
        length: 50,
        nullable: true,
    })
], MenuModel.prototype, "menuName", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_description',
        length: 500,
        nullable: true,
    })
], MenuModel.prototype, "menuDescription", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_closet_file',
        length: 300,
        nullable: true,
    })
], MenuModel.prototype, "menuClosetFile", void 0);
__decorate([
    Column({
        name: 'menu_action_id',
        nullable: true,
    })
], MenuModel.prototype, "menuActionId", void 0);
__decorate([
    Column({
        name: 'cd_obj_id',
        nullable: true,
    })
], MenuModel.prototype, "cdObjId", void 0);
__decorate([
    Column({
        name: 'menu_enabled',
        nullable: true,
    })
], MenuModel.prototype, "menuEnabled", void 0);
__decorate([
    Column({
        name: 'menu_parent_id',
        nullable: true,
    })
], MenuModel.prototype, "menuParentId", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    })
], MenuModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'module_id',
        nullable: true,
    })
], MenuModel.prototype, "moduleId", void 0);
__decorate([
    Column({
        name: 'menu_order',
        nullable: true,
    })
], MenuModel.prototype, "menuOrder", void 0);
__decorate([
    Column('varchar', {
        name: 'path',
        length: 50,
        nullable: true,
    })
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
    })
], MenuModel.prototype, "menuLable", void 0);
__decorate([
    Column('varchar', {
        name: 'menu_icon',
        length: 300,
        nullable: true,
    })
], MenuModel.prototype, "menuIcon", void 0);
__decorate([
    Column({
        name: 'icon_type',
        nullable: true,
    })
], MenuModel.prototype, "iconType", void 0);
__decorate([
    Column({
        name: 'group',
        nullable: true,
    })
], MenuModel.prototype, "group", void 0);
__decorate([
    Column({
        name: 'is_title',
        nullable: true,
    })
], MenuModel.prototype, "isTitle", void 0);
__decorate([
    Column({
        name: 'badge',
        nullable: true,
    })
], MenuModel.prototype, "badge", void 0);
__decorate([
    Column({
        name: 'is_layout',
        nullable: true,
    })
], MenuModel.prototype, "isLayout", void 0);
__decorate([
    Column({
        name: 'menu_is_public',
        type: 'tinyint',
        width: 1,
        default: 0,
    })
], MenuModel.prototype, "menuIsPublic", void 0);
MenuModel = __decorate([
    Entity({
        name: 'menu',
        synchronize: false,
    })
    // @CdModel
], MenuModel);
export { MenuModel };
