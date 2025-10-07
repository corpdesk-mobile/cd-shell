var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// export function siGet(q: IQuery): IServiceInput<CompanyModel> {
//   return {
//     serviceModel: CompanyModel,
//     docName: 'CompanyModel::siGet',
//     cmd: {
//       action: 'find',
//       query: q,
//     },
//     dSource: 1,
//   };
// }
// SELECT company_id, company_type_id, directory_category_id, company_name, postal_address, phone, e_mail, website, physical_location, city, country, area_of_specialization, logo, fax, password, trusted, doc_id, city_id, county_id, company_guid, company_description, parent_id, consumer_id
// FROM cd1213.company;
let CompanyModel = class CompanyModel {
    b;
    companyId;
    companyGuid;
    companyName;
    companyTypeGuid;
    directoryCategoryGuid;
    docId;
    companyEnabled;
    postalAddress;
    phone;
    mobile;
    email;
    physicalLocation;
    city;
    country;
    logo;
    cityGuid;
    company_description;
    parentGuid;
    consumerGuid;
    searchTags;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'company_id',
    })
], CompanyModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'company_guid',
    })
], CompanyModel.prototype, "companyGuid", void 0);
__decorate([
    Column({
        name: 'company_name',
    })
], CompanyModel.prototype, "companyName", void 0);
__decorate([
    Column({
        name: 'company_type_guid',
    })
], CompanyModel.prototype, "companyTypeGuid", void 0);
__decorate([
    Column({
        name: 'directory_category_guid',
    })
], CompanyModel.prototype, "directoryCategoryGuid", void 0);
__decorate([
    Column('int', {
        name: 'doc_id',
    })
], CompanyModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'company_enabled',
    })
], CompanyModel.prototype, "companyEnabled", void 0);
__decorate([
    Column({
        name: 'postal_address',
    })
], CompanyModel.prototype, "postalAddress", void 0);
__decorate([
    Column({
        name: 'phone',
    })
], CompanyModel.prototype, "phone", void 0);
__decorate([
    Column({
        name: 'mobile',
    })
], CompanyModel.prototype, "mobile", void 0);
__decorate([
    Column({
        name: 'email',
    })
], CompanyModel.prototype, "email", void 0);
__decorate([
    Column({
        name: 'physical_location',
    })
], CompanyModel.prototype, "physicalLocation", void 0);
__decorate([
    Column({
        name: 'city',
    })
], CompanyModel.prototype, "city", void 0);
__decorate([
    Column({
        name: 'country',
    })
], CompanyModel.prototype, "country", void 0);
__decorate([
    Column({
        name: 'logo',
    })
], CompanyModel.prototype, "logo", void 0);
__decorate([
    Column({
        name: 'city_guid',
    })
], CompanyModel.prototype, "cityGuid", void 0);
__decorate([
    Column({
        name: 'company_description',
    })
], CompanyModel.prototype, "company_description", void 0);
__decorate([
    Column({
        name: 'parent_guid',
    })
], CompanyModel.prototype, "parentGuid", void 0);
__decorate([
    Column({
        name: 'consumer_guid',
    })
], CompanyModel.prototype, "consumerGuid", void 0);
__decorate([
    Column({
        name: 'search_tags',
    })
], CompanyModel.prototype, "searchTags", void 0);
CompanyModel = __decorate([
    Entity({
        name: 'company',
        synchronize: false,
    })
    // @CdModel
], CompanyModel);
export { CompanyModel };
