var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';
let CdObjTypeModel = class CdObjTypeModel {
    cdObjTypeId;
    cdObjTypeGuid;
    cdObjTypeName;
    docId;
    modCraftController;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_obj_type_id',
    })
], CdObjTypeModel.prototype, "cdObjTypeId", void 0);
__decorate([
    Column({
        name: 'cd_obj_type_guid',
        length: 36,
    })
], CdObjTypeModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_obj_type_name',
        length: 50,
        nullable: true,
    })
], CdObjTypeModel.prototype, "cdObjTypeName", void 0);
__decorate([
    Column({
        name: 'doc_id',
    })
], CdObjTypeModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'mod_craft_controller',
    })
], CdObjTypeModel.prototype, "modCraftController", void 0);
CdObjTypeModel = __decorate([
    Entity({
        name: 'cd_obj_type',
        synchronize: false,
    })
    // @CdModel
], CdObjTypeModel);
export { CdObjTypeModel };
