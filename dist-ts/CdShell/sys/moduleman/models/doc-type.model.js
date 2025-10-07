var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, Column, PrimaryGeneratedColumn, } from 'typeorm';
let DocTypeModel = class DocTypeModel {
    docTypeId;
    docTypeName;
    moduleGuid;
    docGuid;
    docId;
    docTypeController;
    docTypeAction;
    docTypeEnabled;
    enableNotification;
    nkName;
    docTypeIcon;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'doc_type_id',
    })
], DocTypeModel.prototype, "docTypeId", void 0);
__decorate([
    Column({
        name: 'doc_type_name',
    })
], DocTypeModel.prototype, "docTypeName", void 0);
__decorate([
    Column({
        name: 'module_guid',
    })
], DocTypeModel.prototype, "moduleGuid", void 0);
__decorate([
    Column({
        name: 'doc_guid',
    })
], DocTypeModel.prototype, "docGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
    })
], DocTypeModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'doc_type_controller',
    })
], DocTypeModel.prototype, "docTypeController", void 0);
__decorate([
    Column({
        name: 'doc_type_action',
    })
], DocTypeModel.prototype, "docTypeAction", void 0);
__decorate([
    Column({
        name: 'doc_type_enabled',
    })
], DocTypeModel.prototype, "docTypeEnabled", void 0);
__decorate([
    Column({
        name: 'enable_notification',
    })
], DocTypeModel.prototype, "enableNotification", void 0);
__decorate([
    Column({
        name: 'nk_name',
    })
], DocTypeModel.prototype, "nkName", void 0);
__decorate([
    Column({
        name: 'doc_type_icon',
    })
], DocTypeModel.prototype, "docTypeIcon", void 0);
DocTypeModel = __decorate([
    Entity({
        name: 'doc_type',
        synchronize: false,
    })
], DocTypeModel);
export { DocTypeModel };
