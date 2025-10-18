var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
let DocTypeModel = class DocTypeModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'doc_type_id',
    }),
    __metadata("design:type", Number)
], DocTypeModel.prototype, "docTypeId", void 0);
__decorate([
    Column({
        name: 'doc_type_name',
    }),
    __metadata("design:type", String)
], DocTypeModel.prototype, "docTypeName", void 0);
__decorate([
    Column({
        name: 'module_guid',
    }),
    __metadata("design:type", String)
], DocTypeModel.prototype, "moduleGuid", void 0);
__decorate([
    Column({
        name: 'doc_guid',
    }),
    __metadata("design:type", String)
], DocTypeModel.prototype, "docGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
    }),
    __metadata("design:type", Number)
], DocTypeModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'doc_type_controller',
    }),
    __metadata("design:type", String)
], DocTypeModel.prototype, "docTypeController", void 0);
__decorate([
    Column({
        name: 'doc_type_action',
    }),
    __metadata("design:type", String)
], DocTypeModel.prototype, "docTypeAction", void 0);
__decorate([
    Column({
        name: 'doc_type_enabled',
    }),
    __metadata("design:type", Boolean)
], DocTypeModel.prototype, "docTypeEnabled", void 0);
__decorate([
    Column({
        name: 'enable_notification',
    }),
    __metadata("design:type", Boolean)
], DocTypeModel.prototype, "enableNotification", void 0);
__decorate([
    Column({
        name: 'nk_name',
    }),
    __metadata("design:type", String)
], DocTypeModel.prototype, "nkName", void 0);
__decorate([
    Column({
        name: 'doc_type_icon',
    }),
    __metadata("design:type", String)
], DocTypeModel.prototype, "docTypeIcon", void 0);
DocTypeModel = __decorate([
    Entity({
        name: 'doc_type',
        synchronize: false,
    })
], DocTypeModel);
export { DocTypeModel };
