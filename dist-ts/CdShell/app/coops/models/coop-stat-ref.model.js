var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { validateOrReject } from 'class-validator';
let CoopStatRefModel = class CoopStatRefModel {
    coopStatRefId;
    coopStatRefGuid;
    coopStatRefName;
    coopStatRefDescription;
    docId;
    // HOOKS
    async validate() {
        await validateOrReject(this);
    }
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'coop_stat_ref_id',
    })
], CoopStatRefModel.prototype, "coopStatRefId", void 0);
__decorate([
    Column({
        name: 'coop_stat_ref_guid',
        length: 36,
        default: uuidv4(),
    })
], CoopStatRefModel.prototype, "coopStatRefGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_stat_ref_name',
        length: 50,
        nullable: true,
    })
], CoopStatRefModel.prototype, "coopStatRefName", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_stat_ref_description',
        length: 50,
        nullable: true,
    })
], CoopStatRefModel.prototype, "coopStatRefDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CoopStatRefModel.prototype, "docId", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate()
], CoopStatRefModel.prototype, "validate", null);
CoopStatRefModel = __decorate([
    Entity({
        name: 'coop_stat_ref',
        synchronize: false,
    })
    // @CdModel
], CoopStatRefModel);
export { CoopStatRefModel };
