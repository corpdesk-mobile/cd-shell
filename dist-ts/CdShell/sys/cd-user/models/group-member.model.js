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
let GroupMemberModel = class GroupMemberModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'group_member_id',
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "groupMemberId", void 0);
__decorate([
    Column({
        name: 'group_member_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], GroupMemberModel.prototype, "groupMemberGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'group_guid_parent',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], GroupMemberModel.prototype, "groupGuidParent", void 0);
__decorate([
    Column('varchar', {
        name: 'member_guid',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], GroupMemberModel.prototype, "memberGuid", void 0);
__decorate([
    Column({
        name: 'user_id_member',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "userIdMember", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'cd_obj_type_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "cdObjTypeId", void 0);
__decorate([
    Column({
        name: 'group_member_parent_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "groupMemberParentId", void 0);
__decorate([
    Column({
        name: 'group_member_enabled',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], GroupMemberModel.prototype, "groupMemberEnabled", void 0);
__decorate([
    Column({
        name: 'group_invitation_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "groupInvitationId", void 0);
__decorate([
    Column('varchar', {
        name: 'group_id_parent',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "groupIdParent", void 0);
__decorate([
    Column('varchar', {
        name: 'member_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], GroupMemberModel.prototype, "memberId", void 0);
GroupMemberModel = __decorate([
    Entity({
        name: 'group_member',
        synchronize: false,
    })
    // @CdModel
], GroupMemberModel);
export { GroupMemberModel };
