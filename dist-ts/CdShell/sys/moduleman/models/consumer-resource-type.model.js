var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let ConsumerResourceTypeModel = class ConsumerResourceTypeModel {
    consumerResourceTypeId;
    consumerResourceTypeGuid;
    consumerResourceTypeName;
    // consumer_resource_description
    consumerResourceTypeDescription;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'consumer_resource_type_id',
    })
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeId", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_guid',
        length: 36,
        default: uuidv4(),
    })
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeGuid", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_name',
        length: 20,
    })
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeName", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_description',
        length: 200,
    })
], ConsumerResourceTypeModel.prototype, "consumerResourceTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], ConsumerResourceTypeModel.prototype, "docId", void 0);
ConsumerResourceTypeModel = __decorate([
    Entity({
        name: 'consumer_resource_type',
        synchronize: false,
    })
], ConsumerResourceTypeModel);
export { ConsumerResourceTypeModel };
