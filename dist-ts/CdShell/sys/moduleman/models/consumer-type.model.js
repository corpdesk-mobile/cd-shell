var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, } from 'typeorm';
import { validateOrReject } from 'class-validator';
// consumer_resource_type_id, consumer_resource_type_name,
// consumer_resource_description, consumer_resource_type_guid, doc_id
let ConsumerTypeModel = class ConsumerTypeModel {
    consumerTypeId;
    consumerTypeGuid;
    consumerTypeName;
    companyTypeDescription;
    docId;
    // HOOKS
    async validate() {
        await validateOrReject(this);
    }
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'consumer_type_id',
    })
], ConsumerTypeModel.prototype, "consumerTypeId", void 0);
__decorate([
    Column({
        name: 'consumer_type_guid',
        length: 36,
    })
], ConsumerTypeModel.prototype, "consumerTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'consumer_type_name',
        length: 50,
        nullable: true,
    })
], ConsumerTypeModel.prototype, "consumerTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'company_type_description',
        length: 50,
        nullable: true,
    })
], ConsumerTypeModel.prototype, "companyTypeDescription", void 0);
__decorate([
    Column('char', {
        name: 'doc_id',
        length: 60,
        default: null,
    })
], ConsumerTypeModel.prototype, "docId", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate()
], ConsumerTypeModel.prototype, "validate", null);
ConsumerTypeModel = __decorate([
    Entity({
        name: 'consumer_type',
        synchronize: false,
    })
    // @CdModel
], ConsumerTypeModel);
export { ConsumerTypeModel };
