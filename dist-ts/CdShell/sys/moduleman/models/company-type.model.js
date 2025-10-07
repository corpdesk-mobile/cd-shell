var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, } from 'typeorm';
import { validateOrReject } from 'class-validator';
// company_type_id, company_type_name, company_type_description,
// usedIn_asset_registration, directory_categories, company_type_guid, doc_id, parent_id
let CompanyTypeModel = class CompanyTypeModel {
    companyTypeId;
    companyTypeGuid;
    companyTypeName;
    companyTypeDescription;
    docId;
    // HOOKS
    async validate() {
        await validateOrReject(this);
    }
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'company_type_id',
    })
], CompanyTypeModel.prototype, "companyTypeId", void 0);
__decorate([
    Column({
        name: 'company_type_guid',
        length: 36,
    })
], CompanyTypeModel.prototype, "companyTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'company_type_name',
        length: 50,
        nullable: true,
    })
], CompanyTypeModel.prototype, "companyTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'company_type_description',
        length: 50,
        nullable: true,
    })
], CompanyTypeModel.prototype, "companyTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        length: 60,
        default: null,
    })
], CompanyTypeModel.prototype, "docId", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate()
], CompanyTypeModel.prototype, "validate", null);
CompanyTypeModel = __decorate([
    Entity({
        name: 'company_type',
        synchronize: false,
    })
    // @CdModel
], CompanyTypeModel);
export { CompanyTypeModel };
