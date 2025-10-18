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
let GroupModel = class GroupModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'group_id',
    }),
    __metadata("design:type", Number)
], GroupModel.prototype, "groupId", void 0);
__decorate([
    Column({
        name: 'group_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], GroupModel.prototype, "groupGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'group_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], GroupModel.prototype, "groupName", void 0);
__decorate([
    Column('varchar', {
        name: 'group_description',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], GroupModel.prototype, "groupDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'group_owner_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupModel.prototype, "groupOwnerId", void 0);
__decorate([
    Column({
        name: 'group_type_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupModel.prototype, "groupTypeId", void 0);
__decorate([
    Column({
        name: 'module_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], GroupModel.prototype, "moduleGuid", void 0);
__decorate([
    Column({
        name: 'company_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'consumer_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], GroupModel.prototype, "consumerGuid", void 0);
__decorate([
    Column({
        name: 'group_is_public',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], GroupModel.prototype, "groupIsPublic", void 0);
__decorate([
    Column({
        name: 'group_enabled',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], GroupModel.prototype, "groupEnabled", void 0);
GroupModel = __decorate([
    Entity({
        name: 'group',
        synchronize: false,
    })
    // @CdModel
], GroupModel);
export { GroupModel };
