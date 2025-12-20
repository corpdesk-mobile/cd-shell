var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ManyToOne, JoinColumn, } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn } from '../../utils/orm-shim.js';
import { UserModel } from '../../cd-user/models/user.model.js';
let DocModel = class DocModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'doc_id',
    }),
    __metadata("design:type", Number)
], DocModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'doc_guid',
    }),
    __metadata("design:type", String)
], DocModel.prototype, "docGuid", void 0);
__decorate([
    Column({
        name: 'doc_name',
    }),
    __metadata("design:type", String)
], DocModel.prototype, "docName", void 0);
__decorate([
    Column({
        name: 'doc_description',
    }),
    __metadata("design:type", String)
], DocModel.prototype, "docDescription", void 0);
__decorate([
    Column({
        name: 'company_id',
    }),
    __metadata("design:type", String)
], DocModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'doc_from',
    }),
    __metadata("design:type", Number)
], DocModel.prototype, "docFrom", void 0);
__decorate([
    Column({
        name: 'doc_type_id',
    }),
    __metadata("design:type", Number)
], DocModel.prototype, "docTypeId", void 0);
__decorate([
    Column({
        name: 'doc_date',
    }),
    __metadata("design:type", String)
], DocModel.prototype, "docDate", void 0);
__decorate([
    Column({
        name: 'attach_guid',
    }),
    __metadata("design:type", String)
], DocModel.prototype, "attach_guid", void 0);
__decorate([
    Column({
        name: 'doc_expire_date',
    }),
    __metadata("design:type", Date)
], DocModel.prototype, "docExpireDate", void 0);
__decorate([
    Column({
        name: 'doc_enabled',
    }),
    __metadata("design:type", Boolean)
], DocModel.prototype, "docEnabled", void 0);
__decorate([
    ManyToOne((type) => UserModel, (user) => user.docs),
    JoinColumn({ name: 'doc_from' }),
    __metadata("design:type", UserModel)
], DocModel.prototype, "user", void 0);
DocModel = __decorate([
    Entity({
        name: 'doc',
        synchronize: false,
    })
], DocModel);
export { DocModel };
