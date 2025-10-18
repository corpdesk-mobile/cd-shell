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
// return \DB::table('menu')
//             ->join('module, 'menu.module_id, '=, 'module.module_id')
//             ->join('cd_obj, 'menu.menu_action_id, '=, 'cd_obj.cd_obj_id')
//             ->select(\DB::raw(mB::fieldsToStr(self::menu_fields_config($clientAppId))))
//             ->where("active", true)
//             ->distinct();
// @ViewEntity({
//     expression: (connection: Connection) => connection.createQueryBuilder()
//         .select("post.id", "id")
//         .addSelect("post.name", "name")
//         .addSelect("category.name", "categoryName")
//         .from(Post, "post")
//         .leftJoin(Category, "category", "category.id = post.categoryId")
// })
let MenuViewModel = class MenuViewModel {
};
__decorate([
    ViewColumn({
        name: 'menu_id',
    }),
    __metadata("design:type", Number)
], MenuViewModel.prototype, "menuId", void 0);
__decorate([
    ViewColumn({
        name: 'menu_name',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "menuName", void 0);
__decorate([
    ViewColumn({
        name: 'menu_label',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "menuLabel", void 0);
__decorate([
    ViewColumn({
        name: 'menu_guid',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "menuGuid", void 0);
__decorate([
    ViewColumn({
        name: 'closet_file',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "closetFile", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_id',
    }),
    __metadata("design:type", Number)
], MenuViewModel.prototype, "cdObjId", void 0);
__decorate([
    ViewColumn({
        name: 'menu_enabled',
    }),
    __metadata("design:type", Boolean)
], MenuViewModel.prototype, "menuEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'menu_description',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "menuDescription", void 0);
__decorate([
    ViewColumn({
        name: 'menu_icon',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "menuIcon", void 0);
__decorate([
    ViewColumn({
        name: 'icon_type',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "iconType", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    }),
    __metadata("design:type", Number)
], MenuViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'menu_parent_id',
    }),
    __metadata("design:type", Number)
], MenuViewModel.prototype, "menuParentId", void 0);
__decorate([
    ViewColumn({
        name: 'path',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "path", void 0);
__decorate([
    ViewColumn({
        name: 'is_title',
    }),
    __metadata("design:type", Object)
], MenuViewModel.prototype, "isTitle", void 0);
__decorate([
    ViewColumn({
        name: 'badge',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "badge", void 0);
__decorate([
    ViewColumn({
        name: 'is_layout',
    }),
    __metadata("design:type", Object)
], MenuViewModel.prototype, "isLayout", void 0);
__decorate([
    ViewColumn({
        name: 'module_id',
    }),
    __metadata("design:type", Number)
], MenuViewModel.prototype, "moduleId", void 0);
__decorate([
    ViewColumn({
        name: 'module_guid',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "moduleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'module_name',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "moduleName", void 0);
__decorate([
    ViewColumn({
        name: 'module_is_public',
    }),
    __metadata("design:type", Object)
], MenuViewModel.prototype, "moduleIsPublic", void 0);
__decorate([
    ViewColumn({
        name: 'is_sys_module',
    }),
    __metadata("design:type", Object)
], MenuViewModel.prototype, "isSysModule", void 0);
__decorate([
    ViewColumn({
        name: 'children',
    }),
    __metadata("design:type", Array)
], MenuViewModel.prototype, "children", void 0);
__decorate([
    ViewColumn({
        name: 'menu_action',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "menuAction", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_name',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "cdObjName", void 0);
__decorate([
    ViewColumn({
        name: 'last_sync_date',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "lastSyncDate", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_disp_name',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "cdObjDispName", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_guid',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "cdObjGuid", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_guid',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    ViewColumn({
        name: 'last_modification_date',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "lastModificationDate", void 0);
__decorate([
    ViewColumn({
        name: 'parent_module_guid',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "parentModuleGuid", void 0);
__decorate([
    ViewColumn({
        name: 'parent_class_guid',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "parentClassGuid", void 0);
__decorate([
    ViewColumn({
        name: 'parent_obj',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "parentObj", void 0);
__decorate([
    ViewColumn({
        name: 'show_name',
    }),
    __metadata("design:type", Boolean)
], MenuViewModel.prototype, "showName", void 0);
__decorate([
    ViewColumn({
        name: 'icon',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "icon", void 0);
__decorate([
    ViewColumn({
        name: 'show_icon',
    }),
    __metadata("design:type", Boolean)
], MenuViewModel.prototype, "showIcon", void 0);
__decorate([
    ViewColumn({
        name: 'curr_val',
    }),
    __metadata("design:type", String)
], MenuViewModel.prototype, "currVal", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_enabled',
    }),
    __metadata("design:type", Object)
], MenuViewModel.prototype, "cdObjEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'menu_is_public',
    }),
    __metadata("design:type", Number)
], MenuViewModel.prototype, "menuIsPublic", void 0);
MenuViewModel = __decorate([
    ViewEntity({
        name: 'menu_view',
        synchronize: false,
        expression: `
     SELECT 
        menu.menu_id AS menu_id,
        menu.menu_name AS menu_label,
        menu.menu_name AS menu_name,
        menu.menu_guid AS menu_guid,
        menu.menu_closet_file AS closet_file,
        menu.menu_enabled AS menu_enabled,
        menu.menu_description AS menu_description,
        menu.menu_icon AS menu_icon,
        menu.icon_type AS icon_type,
        menu.doc_id AS doc_id,
        menu.menu_parent_id AS menu_parent_id,
        menu.path AS path,
        menu.is_title AS is_title,
        menu.badge AS badge,
        menu.is_layout AS is_layout,
        menu.menu_is_public AS menu_is_public,
        module.module_id AS module_id,
        module.module_guid AS module_guid,
        module.module_name AS module_name,
        module.module_is_public AS module_is_public,
        module.is_sys_module AS is_sys_module,
        (SELECT NULL) AS children,
        (SELECT NULL) AS menu_action,
        cd_obj.cd_obj_id AS cd_obj_id,
        cd_obj.cd_obj_name AS cd_obj_name,
        cd_obj.last_sync_date AS last_sync_date,
        cd_obj.cd_obj_disp_name AS cd_obj_disp_name,
        cd_obj.cd_obj_guid AS cd_obj_guid,
        cd_obj.cd_obj_type_guid AS cd_obj_type_guid,
        cd_obj.last_modification_date AS last_modification_date,
        cd_obj.parent_module_guid AS parent_module_guid,
        cd_obj.parent_class_guid AS parent_class_guid,
        cd_obj.parent_obj AS parent_obj,
        cd_obj.show_name AS show_name,
        cd_obj.icon AS icon,
        cd_obj.show_icon AS show_icon,
        cd_obj.curr_val AS curr_val,
        cd_obj.cd_obj_enabled AS cd_obj_enabled
    FROM
        ((menu
        JOIN module ON ((menu.module_id = module.module_id)))
        JOIN cd_obj ON ((cd_obj.cd_obj_id = menu.cd_obj_id)))
    `,
    })
], MenuViewModel);
export { MenuViewModel };
