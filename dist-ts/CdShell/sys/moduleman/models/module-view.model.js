var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ViewEntity, ViewColumn } from 'typeorm';
let ModuleViewModel = class ModuleViewModel {
    moduleId;
    moduleGuid;
    moduleName;
    moduleDescription;
    moduleTypeId;
    moduleIsPublic;
    isSysModule;
    docId;
    moduleEnabled;
    groupGuid;
    groupName;
    groupOwnerId;
    groupTypeId;
    companyId;
};
__decorate([
    ViewColumn({
        name: 'module_id',
    })
], ModuleViewModel.prototype, "moduleId", void 0);
__decorate([
    ViewColumn({
        name: 'module_guid',
    })
], ModuleViewModel.prototype, "moduleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'module_name',
    })
], ModuleViewModel.prototype, "moduleName", void 0);
__decorate([
    ViewColumn({
        name: 'module_description',
    })
], ModuleViewModel.prototype, "moduleDescription", void 0);
__decorate([
    ViewColumn({
        name: 'module_type_id',
    })
], ModuleViewModel.prototype, "moduleTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'module_is_public',
    })
], ModuleViewModel.prototype, "moduleIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'is_sys_module',
    })
], ModuleViewModel.prototype, "isSysModule", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    })
], ModuleViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'module_enabled',
    })
], ModuleViewModel.prototype, "moduleEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid',
    })
], ModuleViewModel.prototype, "groupGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_name',
    })
], ModuleViewModel.prototype, "groupName", void 0);
__decorate([
    ViewColumn({
        name: 'group_owner_id',
    })
], ModuleViewModel.prototype, "groupOwnerId", void 0);
__decorate([
    ViewColumn({
        name: 'group_type_id',
    })
], ModuleViewModel.prototype, "groupTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'company_id',
    })
], ModuleViewModel.prototype, "companyId", void 0);
ModuleViewModel = __decorate([
    ViewEntity({
        name: 'module_view',
        synchronize: false,
        expression: `
    SELECT
        module.module_id' AS 'module_id,
        module.module_guid' AS 'module_guid,
        module.module_name' AS 'module_name,
        module.module_description' AS 'module_description,
        module.module_type_id' AS 'module_type_id,
        module.module_is_public' AS 'module_is_public,
        module.is_sys_module' AS 'is_sys_module,
        module.doc_id' AS 'doc_id,
        module.module_enabled' AS 'module_enabled,
        module.group_guid' AS 'group_guid,
        group.group_name' AS 'group_name,
        group.group_owner_id' AS 'group_owner_id,
        group.group_type_id' AS 'group_type_id,
        group.company_id' AS 'company_id'
    FROM
        (
            \`group\`
            JOIN 'module' ON ((
                    group.group_guid = module.group_guid
                )));
    `,
    })
], ModuleViewModel);
export { ModuleViewModel };
