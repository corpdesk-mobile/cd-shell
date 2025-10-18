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
let CompanyModel = class CompanyModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'company_id',
    }),
    __metadata("design:type", Number)
], CompanyModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'company_guid',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "companyGuid", void 0);
__decorate([
    Column({
        name: 'company_name',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "companyName", void 0);
__decorate([
    Column({
        name: 'company_type_guid',
    }),
    __metadata("design:type", Number)
], CompanyModel.prototype, "companyTypeGuid", void 0);
__decorate([
    Column({
        name: 'directory_category_guid',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "directoryCategoryGuid", void 0);
__decorate([
    Column('int', {
        name: 'doc_id',
    }),
    __metadata("design:type", Number)
], CompanyModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'company_enabled',
    }),
    __metadata("design:type", Boolean)
], CompanyModel.prototype, "companyEnabled", void 0);
__decorate([
    Column({
        name: 'postal_address',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "postalAddress", void 0);
__decorate([
    Column({
        name: 'phone',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "phone", void 0);
__decorate([
    Column({
        name: 'mobile',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "mobile", void 0);
__decorate([
    Column({
        name: 'email',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "email", void 0);
__decorate([
    Column({
        name: 'physical_location',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "physicalLocation", void 0);
__decorate([
    Column({
        name: 'city',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "city", void 0);
__decorate([
    Column({
        name: 'country',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "country", void 0);
__decorate([
    Column({
        name: 'logo',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "logo", void 0);
__decorate([
    Column({
        name: 'city_guid',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "cityGuid", void 0);
__decorate([
    Column({
        name: 'company_description',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "company_description", void 0);
__decorate([
    Column({
        name: 'parent_guid',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "parentGuid", void 0);
__decorate([
    Column({
        name: 'consumer_guid',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "consumerGuid", void 0);
__decorate([
    Column({
        name: 'search_tags',
    }),
    __metadata("design:type", String)
], CompanyModel.prototype, "searchTags", void 0);
CompanyModel = __decorate([
    Entity({
        name: 'company',
        synchronize: false,
    })
    // @CdModel
], CompanyModel);
export { CompanyModel };
