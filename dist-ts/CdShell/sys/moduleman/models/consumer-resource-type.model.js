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
import { v4 as uuidv4 } from 'uuid';
let ConsumerResourceTypeModel = class ConsumerResourceTypeModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'consumer_resource_type_id',
    }),
    __metadata("design:type", Number)
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeId", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeGuid", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_name',
        length: 20,
    }),
    __metadata("design:type", String)
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeName", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_description',
        length: 200,
    }),
    __metadata("design:type", String)
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], ConsumerResourceTypeModel.prototype, "docId", void 0);
ConsumerResourceTypeModel = __decorate([
    Entity({
        name: 'consumer_resource_type',
        synchronize: false,
    })
], ConsumerResourceTypeModel);
export { ConsumerResourceTypeModel };
