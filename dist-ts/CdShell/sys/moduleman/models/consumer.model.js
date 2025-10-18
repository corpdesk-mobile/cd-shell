var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
let ConsumerModel = class ConsumerModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'consumer_id',
    }),
    __metadata("design:type", Number)
], ConsumerModel.prototype, "consumerId", void 0);
__decorate([
    Column({
        name: 'consumer_guid',
        length: 36,
    }),
    __metadata("design:type", String)
], ConsumerModel.prototype, "consumerGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'consumer_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], ConsumerModel.prototype, "consumerName", void 0);
__decorate([
    Column('tinyint', {
        name: 'consumer_enabled',
        default: null,
    }),
    __metadata("design:type", Object)
], ConsumerModel.prototype, "consumerEnabled", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], ConsumerModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'company_id',
        default: null,
    }),
    __metadata("design:type", Number)
], ConsumerModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'company_guid',
        default: null,
    }),
    __metadata("design:type", String)
], ConsumerModel.prototype, "companyGuid", void 0);
ConsumerModel = __decorate([
    Entity({
        name: 'consumer',
        synchronize: false,
    })
    // @CdModel
], ConsumerModel);
export { ConsumerModel };
