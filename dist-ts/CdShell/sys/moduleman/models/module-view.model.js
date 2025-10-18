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
let ModuleViewModel = class ModuleViewModel {
};
__decorate([
    ViewColumn({
        name: 'module_id',
    }),
    __metadata("design:type", Number)
], ModuleViewModel.prototype, "moduleId", void 0);
__decorate([
    ViewColumn({
        name: 'module_guid',
    }),
    __metadata("design:type", String)
], ModuleViewModel.prototype, "moduleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'module_name',
    }),
    __metadata("design:type", String)
], ModuleViewModel.prototype, "moduleName", void 0);
__decorate([
    ViewColumn({
        name: 'module_description',
    }),
    __metadata("design:type", String)
], ModuleViewModel.prototype, "moduleDescription", void 0);
__decorate([
    ViewColumn({
        name: 'module_type_id',
    }),
    __metadata("design:type", Number)
], ModuleViewModel.prototype, "moduleTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'module_is_public',
    }),
    __metadata("design:type", Number)
], ModuleViewModel.prototype, "moduleIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'is_sys_module',
    }),
    __metadata("design:type", Number)
], ModuleViewModel.prototype, "isSysModule", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    }),
    __metadata("design:type", String)
], ModuleViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'module_enabled',
    }),
    __metadata("design:type", Object)
], ModuleViewModel.prototype, "moduleEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'group_guid',
    }),
    __metadata("design:type", String)
], ModuleViewModel.prototype, "groupGuid", void 0);
__decorate([
    ViewColumn({
        name: 'group_name',
    }),
    __metadata("design:type", String)
], ModuleViewModel.prototype, "groupName", void 0);
__decorate([
    ViewColumn({
        name: 'group_owner_id',
    }),
    __metadata("design:type", Object)
], ModuleViewModel.prototype, "groupOwnerId", void 0);
__decorate([
    ViewColumn({
        name: 'group_type_id',
    }),
    __metadata("design:type", Number)
], ModuleViewModel.prototype, "groupTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'company_id',
    }),
    __metadata("design:type", String)
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
