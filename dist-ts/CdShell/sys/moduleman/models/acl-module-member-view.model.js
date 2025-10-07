var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * retrieve group members of MODULE groups
 */
import { ViewEntity, ViewColumn } from 'typeorm';
let AclModuleMemberViewModel = class AclModuleMemberViewModel {
    groupId;
    groupGuid;
    groupName;
    groupOwnerId;
    groupTypeId;
    moduleGuid;
    groupIsPublic;
    groupEnabled;
    groupMemberId;
    groupMemberGuid;
    groupGuidParent;
    memberGuid;
    userIdMember;
    cdObjTypeId;
    groupMemberParentId;
    groupMemberEnabled;
    moduleEnabled;
    moduleIsPublic;
    moduleId;
    moduleName;
    isSysModule;
    moduleTypeId;
};
__decorate([
    ViewColumn({
        name: 'group_id',
    })
], AclModuleMemberViewModel.prototype, "groupId", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid',
    })
], AclModuleMemberViewModel.prototype, "groupGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_name',
    })
], AclModuleMemberViewModel.prototype, "groupName", void 0);
__decorate([
    ViewColumn({
        name: 'group_owner_id',
    })
], AclModuleMemberViewModel.prototype, "groupOwnerId", void 0);
__decorate([
    ViewColumn({
        name: 'group_type_id',
    })
], AclModuleMemberViewModel.prototype, "groupTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'module_guid',
    })
], AclModuleMemberViewModel.prototype, "moduleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_is_public',
    })
], AclModuleMemberViewModel.prototype, "groupIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'group_enabled',
    })
], AclModuleMemberViewModel.prototype, "groupEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'group_member_id',
    })
], AclModuleMemberViewModel.prototype, "groupMemberId", void 0);
__decorate([
    ViewColumn({
        name: 'group_member_guid',
    })
], AclModuleMemberViewModel.prototype, "groupMemberGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid_parent',
    })
], AclModuleMemberViewModel.prototype, "groupGuidParent", void 0);
__decorate([
    ViewColumn({
        name: 'member_guid',
    })
], AclModuleMemberViewModel.prototype, "memberGuid", void 0);
__decorate([
    ViewColumn({
        name: 'user_id_member',
    })
], AclModuleMemberViewModel.prototype, "userIdMember", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_id',
    })
], AclModuleMemberViewModel.prototype, "cdObjTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'group_member_parent_id',
    })
], AclModuleMemberViewModel.prototype, "groupMemberParentId", void 0);
__decorate([
    ViewColumn({
        name: 'group_member_enabled',
    })
], AclModuleMemberViewModel.prototype, "groupMemberEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'module_enabled',
    })
], AclModuleMemberViewModel.prototype, "moduleEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'module_is_public',
    })
], AclModuleMemberViewModel.prototype, "moduleIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'module_id',
    })
], AclModuleMemberViewModel.prototype, "moduleId", void 0);
__decorate([
    ViewColumn({
        name: 'module_name',
    })
], AclModuleMemberViewModel.prototype, "moduleName", void 0);
__decorate([
    ViewColumn({
        name: 'is_sys_module',
    })
], AclModuleMemberViewModel.prototype, "isSysModule", void 0);
__decorate([
    ViewColumn({
        name: 'module_type_id',
    })
], AclModuleMemberViewModel.prototype, "moduleTypeId", void 0);
AclModuleMemberViewModel = __decorate([
    ViewEntity({
        name: 'acl_module_member_view',
        synchronize: false,
        expression: `
        select distinct
            group.group_id AS group_id,
            group.group_guid AS group_guid,
            group.group_name AS group_name,
            group.group_owner_id AS group_owner_id,
            group.group_type_id AS group_type_id,
            group.group_is_public AS group_is_public,
            group.group_enabled AS group_enabled,
            group_member.group_member_id AS group_member_id,
            group_member.group_member_guid AS group_member_guid,
            group_member.group_guid_parent AS group_guid_parent,
            group_member.member_guid AS member_guid,
            group_member.user_id_member AS user_id_member,
            group_member.cd_obj_type_id AS cd_obj_type_id,
            group_member.group_member_parent_id AS group_member_parent_id,
            group_member.group_member_enabled AS group_member_enabled,
            module.module_id AS module_id,
            module.module_name AS module_name,
            module.module_guid AS module_guid,
            module.module_is_public AS module_is_public,
            module.is_sys_module AS is_sys_module,
            module.module_enabled AS module_enabled,
            module.module_type_id AS module_type_id'
        FROM  \`group\`
        INNER JOIN group_member ON
            group.group_guid = group_member.group_guid_parent
        INNER JOIN  module on
            group_member.group_guid_parent = module.module_guid
        WHERE
            group_member.cd_obj_type_id = 9;
    `,
    })
], AclModuleMemberViewModel);
export { AclModuleMemberViewModel };
