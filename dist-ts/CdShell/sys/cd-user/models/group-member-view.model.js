var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ViewEntity, ViewColumn } from 'typeorm';
let GroupMemberViewModel = class GroupMemberViewModel {
    groupId;
    groupGuid;
    groupName;
    memberName;
    groupDescription;
    groupOwnerId;
    docId;
    groupTypeId;
    moduleGuid;
    companyId;
    groupIsPublic;
    groupEnabled;
    groupMemberId;
    memberGuid;
    groupGuidParent;
    cdObjTypeId;
    userIdMember;
};
__decorate([
    ViewColumn({
        name: 'group_id',
    })
], GroupMemberViewModel.prototype, "groupId", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid',
    })
], GroupMemberViewModel.prototype, "groupGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_name',
    })
], GroupMemberViewModel.prototype, "groupName", void 0);
__decorate([
    ViewColumn({
        name: 'member_name',
    })
], GroupMemberViewModel.prototype, "memberName", void 0);
__decorate([
    ViewColumn({
        name: 'group_description',
    })
], GroupMemberViewModel.prototype, "groupDescription", void 0);
__decorate([
    ViewColumn({
        name: 'group_owner_id',
    })
], GroupMemberViewModel.prototype, "groupOwnerId", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    })
], GroupMemberViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'group_type_id',
    })
], GroupMemberViewModel.prototype, "groupTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'module_guid',
    })
], GroupMemberViewModel.prototype, "moduleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'company_id',
    })
], GroupMemberViewModel.prototype, "companyId", void 0);
__decorate([
    ViewColumn({
        name: 'group_is_public',
    })
], GroupMemberViewModel.prototype, "groupIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'group_enabled',
    })
], GroupMemberViewModel.prototype, "groupEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'group_member_id',
    })
], GroupMemberViewModel.prototype, "groupMemberId", void 0);
__decorate([
    ViewColumn({
        name: 'member_guid',
    })
], GroupMemberViewModel.prototype, "memberGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid_parent',
    })
], GroupMemberViewModel.prototype, "groupGuidParent", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_id',
    })
], GroupMemberViewModel.prototype, "cdObjTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'user_id_member',
    })
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
