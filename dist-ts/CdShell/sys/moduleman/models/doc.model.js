var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, Column, PrimaryGeneratedColumn, } from 'typeorm';
let DocModel = class DocModel {
    docId;
    docGuid;
    docName;
    docDescription;
    companyId;
    docFrom;
    docTypeId;
    docDate;
    attach_guid;
    docExpireDate;
    docEnabled;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'doc_id',
    })
], DocModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'doc_guid',
    })
], DocModel.prototype, "docGuid", void 0);
__decorate([
    Column({
        name: 'doc_name',
    })
], DocModel.prototype, "docName", void 0);
__decorate([
    Column({
        name: 'doc_description',
    })
], DocModel.prototype, "docDescription", void 0);
__decorate([
    Column({
        name: 'company_id',
    })
], DocModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'doc_from',
    })
], DocModel.prototype, "docFrom", void 0);
__decorate([
    Column({
        name: 'doc_type_id',
    })
], DocModel.prototype, "docTypeId", void 0);
__decorate([
    Column({
        name: 'doc_date',
    })
], DocModel.prototype, "docDate", void 0);
__decorate([
    Column({
        name: 'attach_guid',
    })
], DocModel.prototype, "attach_guid", void 0);
__decorate([
    Column({
        name: 'doc_expire_date',
    })
], DocModel.prototype, "docExpireDate", void 0);
__decorate([
    Column({
        name: 'doc_enabled',
    })
], DocModel.prototype, "docEnabled", void 0);
DocModel = __decorate([
    Entity({
        name: 'doc',
        synchronize: false,
    })
], DocModel);
export { DocModel };
