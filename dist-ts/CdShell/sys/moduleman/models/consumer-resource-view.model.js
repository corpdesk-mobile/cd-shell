var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ViewEntity, ViewColumn } from 'typeorm';
let ConsumerResourceViewModel = class ConsumerResourceViewModel {
};
__decorate([
    ViewColumn({
        name: 'consumer_id',
    }),
    __metadata("design:type", Number)
], ConsumerResourceViewModel.prototype, "consumerId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_name',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerResourceName", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_id',
    }),
    __metadata("design:type", Number)
], ConsumerResourceViewModel.prototype, "cdObjTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_id',
    }),
    __metadata("design:type", Number)
], ConsumerResourceViewModel.prototype, "cdObjId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_type_id',
    }),
    __metadata("design:type", Number)
], ConsumerResourceViewModel.prototype, "consumerResourceTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'obj_guid',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "objGuid", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_guid',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerGuid", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_name',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerName", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_id',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerResourceId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_guid',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerResourceGuid", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    }),
    __metadata("design:type", Number)
], ConsumerResourceViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_enabled',
    }),
    __metadata("design:type", Boolean)
], ConsumerResourceViewModel.prototype, "consumerResourceEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'obj_id',
    }),
    __metadata("design:type", Number)
], ConsumerResourceViewModel.prototype, "objId", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_type_guid',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerResourceTypeGuid", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_icon',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerResourceIcon", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_resource_link',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "consumerResourceLink", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_guid',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "cdObjGuid", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_name',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "cdObjName", void 0);
__decorate([
    ViewColumn({
        name: 'cd_obj_type_guid',
    }),
    __metadata("design:type", String)
], ConsumerResourceViewModel.prototype, "cdObjTypeGuide", void 0);
ConsumerResourceViewModel = __decorate([
    ViewEntity({
        name: 'consumer_resource_view',
        synchronize: false,
        expression: `
        SELECT 
            consumer_resource.consumer_id AS consumer_id,
            consumer_resource.consumer_resource_name AS consumer_resource_name,
            consumer_resource.cd_obj_type_id AS cd_obj_type_id,
            consumer_resource.cd_obj_id AS cd_obj_id,
            consumer_resource.consumer_resource_type_id AS consumer_resource_type_id,
            consumer_resource.consumer_resource_id AS consumer_resource_id,
            consumer_resource.consumer_resource_guid AS consumer_resource_guid,
            consumer_resource.doc_id AS doc_id,
            consumer_resource.consumer_resource_enabled AS consumer_resource_enabled,
            consumer_resource.consumer_resource_type_guid AS consumer_resource_type_guid,
            consumer_resource.consumer_resource_icon AS consumer_resource_icon,
            consumer_resource.consumer_resource_link AS consumer_resource_link,
            consumer.consumer_guid AS consumer_guid,
            consumer.consumer_name AS consumer_name,
            cd_obj.cd_obj_guid AS cd_obj_guid,
            cd_obj.obj_guid AS obj_guid,
            cd_obj.obj_id AS obj_id,
            cd_obj.cd_obj_name AS cd_obj_name,
            cd_obj.cd_obj_type_guid AS cd_obj_type_guid
        FROM
            ((consumer_resource
            JOIN cd_obj ON ((consumer_resource.cd_obj_id = cd_obj.cd_obj_id)))
            JOIN consumer ON ((consumer_resource.consumer_id = consumer.consumer_id)));
        `,
    })
], ConsumerResourceViewModel);
export { ConsumerResourceViewModel };
