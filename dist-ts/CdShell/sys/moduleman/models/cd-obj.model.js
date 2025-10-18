var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
export const defaultCdObjEnv = {
    ctx: 'Sys',
    m: 'Moduleman',
    c: 'CdObj',
    a: '',
    dat: {
        f_vals: [],
        token: '',
    },
    args: {},
};
let CdObjModel = class CdObjModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_obj_id',
    }),
    __metadata("design:type", Number)
], CdObjModel.prototype, "cdObjId", void 0);
__decorate([
    Column({
        name: 'cd_obj_guid',
        length: 36,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "cdObjGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_obj_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "cdObjName", void 0);
__decorate([
    Column('char', {
        name: 'cd_obj_type_guid',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    Column('datetime', {
        name: 'last_sync_date',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], CdObjModel.prototype, "lastSyncDate", void 0);
__decorate([
    Column('datetime', {
        name: 'last_modification_date',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], CdObjModel.prototype, "lastModificationDate", void 0);
__decorate([
    Column({
        name: 'parent_module_guid',
        default: null,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "parentModuleGuid", void 0);
__decorate([
    Column({
        name: 'parent_module_id',
        default: null,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "parentModuleId", void 0);
__decorate([
    Column({
        name: 'parent_class_guid',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], CdObjModel.prototype, "parentClassGuid", void 0);
__decorate([
    Column({
        name: 'parent_obj',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], CdObjModel.prototype, "parentObj", void 0);
__decorate([
    Column('datetime', {
        name: 'cd_obj_disp_name',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], CdObjModel.prototype, "cdObjDispName", void 0);
__decorate([
    Column({
        name: 'obj_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdObjModel.prototype, "objId", void 0);
__decorate([
    Column({
        name: 'obj_guid',
        default: null,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "objGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdObjModel.prototype, "docId", void 0);
__decorate([
    Column('bit', {
        name: 'show_name',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", Boolean)
], CdObjModel.prototype, "showName", void 0);
__decorate([
    Column('varchar', {
        name: 'icon',
        default: null,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "icon", void 0);
__decorate([
    Column('bit', {
        name: 'show_icon',
        default: null,
    }),
    __metadata("design:type", Boolean)
], CdObjModel.prototype, "showIcon", void 0);
__decorate([
    Column('varchar', {
        name: 'curr_val',
        default: null,
    }),
    __metadata("design:type", String)
], CdObjModel.prototype, "currVal", void 0);
__decorate([
    Column('bit', {
        name: 'cd_obj_enabled',
        default: null,
    }),
    __metadata("design:type", Boolean)
], CdObjModel.prototype, "cdObjEnabled", void 0);
__decorate([
    Column({
        name: 'j_details',
        default: null,
    }),
    __metadata("design:type", Object)
], CdObjModel.prototype, "jDetails", void 0);
CdObjModel = __decorate([
    Entity({
        name: 'cd_obj',
        synchronize: false,
    })
    // @CdModel
], CdObjModel);
export { CdObjModel };
