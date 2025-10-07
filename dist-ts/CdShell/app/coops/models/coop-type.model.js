var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { validateOrReject } from 'class-validator';
let CoopTypeModel = class CoopTypeModel {
    coopTypeId;
    coopTypeGuid;
    coopTypeName;
    coopTypeDescription;
    docId;
    parentGuid;
    coopTypeEnabled;
    // HOOKS
    async validate() {
        await validateOrReject(this);
    }
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'coop_type_id',
    })
], CoopTypeModel.prototype, "coopTypeId", void 0);
__decorate([
    Column({
        name: 'coop_type_guid',
        length: 36,
        default: uuidv4(),
    })
], CoopTypeModel.prototype, "coopTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_type_name',
        length: 50,
        nullable: true,
    })
], CoopTypeModel.prototype, "coopTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_type_description',
        length: 50,
        nullable: true,
    })
], CoopTypeModel.prototype, "coopTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CoopTypeModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'parent_guid',
        default: null,
    })
], CoopTypeModel.prototype, "parentGuid", void 0);
__decorate([
    Column({
        name: 'coop_type_enabled',
        default: null,
    })
], CoopTypeModel.prototype, "coopTypeEnabled", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate()
], CoopTypeModel.prototype, "validate", null);
CoopTypeModel = __decorate([
    Entity({
        name: 'coop_type',
        synchronize: false,
    })
    // @CdModel
], CoopTypeModel);
export { CoopTypeModel };
