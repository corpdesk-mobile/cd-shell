var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ViewEntity, ViewColumn } from 'typeorm';
let AclModuleViewModel = class AclModuleViewModel {
    consumerResourceId;
    consumerResourceName;
    consumerId;
    consumerGuid;
    cdObjId;
    cdObjGuid;
    objGuid;
    cdObjName;
    cdObjTypeGuid;
    cdObjTypeId;
    moduleId;
    moduleGuid;
    moduleName;
    moduleIsPublic;
    isSysModule;
    moduleEnabled;
    groupGuid;
    moduleTypeId;
};
__decorate([
    ViewColumn({
        name: 'consumer_resource_id',
    })
], AclModuleViewModel.prototype, "consumerResourceId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_name',
    })
], AclModuleViewModel.prototype, "consumerResourceName", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_id',
    })
], AclModuleViewModel.prototype, "consumerId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_guid',
    })
], AclModuleViewModel.prototype, "consumerGuid", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_id',
    })
], AclModuleViewModel.prototype, "cdObjId", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_guid',
    })
], AclModuleViewModel.prototype, "cdObjGuid", void 0);
__decorate([
    ViewColumn({
        name: 'obj_guid',
    })
], AclModuleViewModel.prototype, "objGuid", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_name',
    })
], AclModuleViewModel.prototype, "cdObjName", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_guid',
    })
], AclModuleViewModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_id',
    })
], AclModuleViewModel.prototype, "cdObjTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'module_id',
    })
], AclModuleViewModel.prototype, "moduleId", void 0);
__decorate([
    ViewColumn({
        name: 'module_guid',
    })
], AclModuleViewModel.prototype, "moduleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'module_name',
    })
], AclModuleViewModel.prototype, "moduleName", void 0);
__decorate([
    ViewColumn({
        name: 'module_is_public',
    })
], AclModuleViewModel.prototype, "moduleIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'is_sys_module',
    })
], AclModuleViewModel.prototype, "isSysModule", void 0);
__decorate([
    ViewColumn({
        name: 'module_enabled',
    })
], AclModuleViewModel.prototype, "moduleEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid',
    })
], AclModuleViewModel.prototype, "groupGuid", void 0);
__decorate([
    ViewColumn({
        name: 'module_type_id',
    })
], AclModuleViewModel.prototype, "moduleTypeId", void 0);
AclModuleViewModel = __decorate([
    ViewEntity({
        name: 'acl_module_view',
        synchronize: false,
        expression: `
        select
            consumer_resource.consumer_id AS consumer_id,
            consumer_resource.consumer_resource_name AS consumer_resource_name,
            consumer_resource.cd_obj_type_id AS cd_obj_type_id,
            consumer_resource.cd_obj_id AS cd_obj_id,
            consumer_resource.consumer_resource_type_id AS consumer_resource_type_id,
            consumer_resource.consumer_resource_id AS consumer_resource_id,
            consumer_resource.consumer_resource_guid AS consumer_resource_guid,
            consumer_resource.doc_id AS doc_id,
            consumer_resource.consumer_resource_enabled AS consumer_resource_enabled,
            consumer_resource.consumer_resource_type_guid AS consumer_resource_type_guid,
            consumer.consumer_guid AS consumer_guid,
            cd_obj.cd_obj_guid AS cd_obj_guid,
            cd_obj.obj_guid AS obj_guid,
            cd_obj.obj_id AS obj_id,
            cd_obj.cd_obj_name AS cd_obj_name,
            cd_obj.cd_obj_type_guid AS cd_obj_type_guid
        from
            ((consumer_resource
        join cd_obj on
            ((consumer_resource.cd_obj_id = cd_obj.cd_obj_id)))
        join consumer on
            ((consumer_resource.consumer_id = consumer.consumer_id)))
    `,
    })
], AclModuleViewModel);
export { AclModuleViewModel };
