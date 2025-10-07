var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ViewEntity, ViewColumn } from 'typeorm';
let AclUserViewModel = class AclUserViewModel {
    userId;
    userGuid;
    userName;
    userEnabled;
    companyId;
    userTypeId;
    consumerId;
    cdObjTypeId;
    cdObjId;
    objGuid;
    consumerGuid;
    consumerResourceTypeId;
};
__decorate([
    ViewColumn({
        name: 'user_id',
    })
], AclUserViewModel.prototype, "userId", void 0);
__decorate([
    ViewColumn({
        name: 'user_guid',
    })
], AclUserViewModel.prototype, "userGuid", void 0);
__decorate([
    ViewColumn({
        name: 'user_name',
    })
], AclUserViewModel.prototype, "userName", void 0);
__decorate([
    ViewColumn({
        name: 'user_enabled',
    })
], AclUserViewModel.prototype, "userEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'company_id',
    })
], AclUserViewModel.prototype, "companyId", void 0);
__decorate([
    ViewColumn({
        name: 'user_type_id',
    })
], AclUserViewModel.prototype, "userTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_id',
    })
], AclUserViewModel.prototype, "consumerId", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_id',
    })
], AclUserViewModel.prototype, "cdObjTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_id',
    })
], AclUserViewModel.prototype, "cdObjId", void 0);
__decorate([
    ViewColumn({
        name: 'obj_guid',
    })
], AclUserViewModel.prototype, "objGuid", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_guid',
    })
], AclUserViewModel.prototype, "consumerGuid", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_type_id',
    })
], AclUserViewModel.prototype, "consumerResourceTypeId", void 0);
AclUserViewModel = __decorate([
    ViewEntity({
        name: 'acl_user_view',
        synchronize: false,
        expression: `
            SELECT
                user.user_id,
                user.user_guid,
                user.user_name,
                user.password,
                user.email,
                user.doc_id,
                user.mobile,
                user.gender,
                user.birth_date,
                user.postal_addr,
                user.f_name,
                user.m_name,
                user.l_name,
                user.national_id,
                user.passport_id,
                user.user_enabled,
                user.zip_code,
                user.activation_key,
                user.company_id,
                user.user_type_id,
                consumer_resource_view.consumer_id,
                consumer_resource_view.cd_obj_type_id,
                consumer_resource_view.cd_obj_id,
                consumer_resource_view.obj_guid,
                consumer_resource_view.consumer_guid,
            consumer_resource_view.consumer_resource_type_id
            FROM
                user
                INNER JOIN consumer_resource_view ON user.user_guid = consumer_resource_view.obj_guid;
    `,
    })
], AclUserViewModel);
export { AclUserViewModel };
