var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let ConsumerResourceModel = class ConsumerResourceModel {
    consumerResourceId;
    consumerResourceGuid;
    consumerResourceName;
    docId;
    cdObjTypeId;
    consumerResourceEnabled;
    consumerId;
    objId;
    cdObjId;
    consumerResourceTypeId;
    consumerGuid;
    objGuid;
    cdObjTypeGuid;
    consumerResourceTypeGuid;
    cdObjGuid;
    consumerResourceIcon;
    consumerResourceLink;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'consumer_resource_id',
    })
], ConsumerResourceModel.prototype, "consumerResourceId", void 0);
__decorate([
    Column({
        name: 'consumer_resource_guid',
        length: 40,
        default: uuidv4(),
    })
], ConsumerResourceModel.prototype, "consumerResourceGuid", void 0);
__decorate([
    Column({
        name: 'consumer_resource_name',
        default: null,
    })
], ConsumerResourceModel.prototype, "consumerResourceName", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], ConsumerResourceModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'cd_obj_type_id',
        default: null,
    })
], ConsumerResourceModel.prototype, "cdObjTypeId", void 0);
__decorate([
    Column({
        name: 'consumer_resource_enabled',
        default: null,
    })
], ConsumerResourceModel.prototype, "consumerResourceEnabled", void 0);
__decorate([
    Column({
        name: 'consumer_id',
        default: null,
    })
], ConsumerResourceModel.prototype, "consumerId", void 0);
__decorate([
    Column({
        name: 'obj_id',
        default: null,
    })
], ConsumerResourceModel.prototype, "objId", void 0);
__decorate([
    Column({
        name: 'cd_obj_id',
        default: null,
    })
], ConsumerResourceModel.prototype, "cdObjId", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_id',
        default: null,
    })
], ConsumerResourceModel.prototype, "consumerResourceTypeId", void 0);
__decorate([
    Column({
        name: 'consumer_guid',
        length: 40,
        default: uuidv4(),
    })
], ConsumerResourceModel.prototype, "consumerGuid", void 0);
__decorate([
    Column({
        name: 'obj_guid',
        length: 40,
        default: uuidv4(),
    })
], ConsumerResourceModel.prototype, "objGuid", void 0);
__decorate([
    Column({
        name: 'cd_obj_type_guid',
        length: 40,
        default: uuidv4(),
    })
], ConsumerResourceModel.prototype, "cdObjTypeGuid", void 0);
__decorate([
    Column({
        name: 'consumer_resource_type_guid',
        length: 40,
        default: uuidv4(),
    })
], ConsumerResourceModel.prototype, "consumerResourceTypeGuid", void 0);
__decorate([
    Column({
        name: 'cd_obj_guid',
        length: 40,
        default: uuidv4(),
    })
], ConsumerResourceModel.prototype, "cdObjGuid", void 0);
__decorate([
    Column({
        name: 'consumer_resource_icon',
    })
], ConsumerResourceModel.prototype, "consumerResourceIcon", void 0);
__decorate([
    Column({
        name: 'consumer_resource_link',
    })
], ConsumerResourceModel.prototype, "consumerResourceLink", void 0);
ConsumerResourceModel = __decorate([
    Entity({
        name: 'consumer_resource',
        synchronize: false,
    })
], ConsumerResourceModel);
export { ConsumerResourceModel };
