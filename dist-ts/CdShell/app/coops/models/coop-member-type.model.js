var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let CoopMemberTypeModel = class CoopMemberTypeModel {
    coopMemberTypeId;
    coopTypeGuid;
    coopMemberTypeName;
    coopMemberTypeDescription;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'coop_member_type_id',
    })
], CoopMemberTypeModel.prototype, "coopMemberTypeId", void 0);
__decorate([
    Column({
        name: 'coop_member_type_guid',
        length: 36,
        default: uuidv4(),
    })
], CoopMemberTypeModel.prototype, "coopTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_member_type_name',
        length: 50,
        nullable: true,
    })
], CoopMemberTypeModel.prototype, "coopMemberTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_member_type_description',
        length: 50,
        nullable: true,
    })
], CoopMemberTypeModel.prototype, "coopMemberTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CoopMemberTypeModel.prototype, "docId", void 0);
CoopMemberTypeModel = __decorate([
    Entity({
        name: 'coop_member_type',
        synchronize: false,
    })
    // @CdModel
], CoopMemberTypeModel);
export { CoopMemberTypeModel };
