var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ViewEntity, ViewColumn } from 'typeorm';
let GroupMemberViewModel = class GroupMemberViewModel {
};
__decorate([
    ViewColumn({
        name: 'group_id',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "groupId", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid',
    }),
    __metadata("design:type", String)
], GroupMemberViewModel.prototype, "groupGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_name',
    }),
    __metadata("design:type", String)
], GroupMemberViewModel.prototype, "groupName", void 0);
__decorate([
    ViewColumn({
        name: 'member_name',
    }),
    __metadata("design:type", String)
], GroupMemberViewModel.prototype, "memberName", void 0);
__decorate([
    ViewColumn({
        name: 'group_description',
    }),
    __metadata("design:type", String)
], GroupMemberViewModel.prototype, "groupDescription", void 0);
__decorate([
    ViewColumn({
        name: 'group_owner_id',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "groupOwnerId", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'group_type_id',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "groupTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'module_guid',
    }),
    __metadata("design:type", String)
], GroupMemberViewModel.prototype, "moduleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'company_id',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "companyId", void 0);
__decorate([
    ViewColumn({
        name: 'group_is_public',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "groupIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'group_enabled',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "groupEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'group_member_id',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "groupMemberId", void 0);
__decorate([
    ViewColumn({
        name: 'member_guid',
    }),
    __metadata("design:type", String)
], GroupMemberViewModel.prototype, "memberGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid_parent',
    }),
    __metadata("design:type", String)
], GroupMemberViewModel.prototype, "groupGuidParent", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_id',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "cdObjTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'user_id_member',
    }),
    __metadata("design:type", Number)
], GroupMemberViewModel.prototype, "userIdMember", void 0);
GroupMemberViewModel = __decorate([
    ViewEntity({
        name: 'group_member_view',
        synchronize: false,
        expression: `
            SELECT DISTINCT
                group.group_id AS group_id,
                group.group_guid AS group_guid,
                group.group_name AS group_name,
                group.group_name AS member_name,
                group.group_description AS group_description,
                group.group_owner_id AS group_owner_id,
                group.doc_id AS doc_id,
                group.group_type_id AS group_type_id,
                group.module_guid AS module_guid,
                group.company_id AS company_id,
                group.group_is_public AS group_is_public,
                group.group_enabled AS group_enabled,
                group_member.group_member_id AS group_member_id,
                group_member.member_guid AS member_guid,
                group_member.group_guid_parent AS group_guid_parent,
                group_member.cd_obj_type_id AS cd_obj_type_id,
                group_member.user_id_member AS user_id_member
            FROM
                (
                    \`group\`
                    JOIN group_member ON ((
                        group.group_guid = group_member.member_guid
                )))
    `,
    })
], GroupMemberViewModel);
export { GroupMemberViewModel };
