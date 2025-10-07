var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ViewEntity, ViewColumn } from 'typeorm';
let CompanyViewModel = class CompanyViewModel {
    companyId;
    companyGuid;
    companyName;
    companyTypeGuid;
    directoryCategoryGuid;
    companyTypeName;
    postalAddress;
    phone;
    mobile;
    email;
    website;
    physicalLocation;
    city;
    country;
    logo;
    companyEnabled;
    docId;
    cityGuid;
    countyGuid;
    company_description;
    parentGuid;
    consumerGuid;
    searchTags;
};
__decorate([
    ViewColumn({
        name: 'company_id',
    })
], CompanyViewModel.prototype, "companyId", void 0);
__decorate([
    ViewColumn({
        name: 'company_guid',
    })
], CompanyViewModel.prototype, "companyGuid", void 0);
__decorate([
    ViewColumn({
        name: 'company_name',
    })
], CompanyViewModel.prototype, "companyName", void 0);
__decorate([
    ViewColumn({
        name: 'company_type_guid',
    })
], CompanyViewModel.prototype, "companyTypeGuid", void 0);
__decorate([
    ViewColumn({
        name: 'directory_category_guid',
    })
], CompanyViewModel.prototype, "directoryCategoryGuid", void 0);
__decorate([
    ViewColumn({
        name: 'company_type_name',
    })
], CompanyViewModel.prototype, "companyTypeName", void 0);
__decorate([
    ViewColumn({
        name: 'postal_address',
    })
], CompanyViewModel.prototype, "postalAddress", void 0);
__decorate([
    ViewColumn({
        name: 'phone',
    })
], CompanyViewModel.prototype, "phone", void 0);
__decorate([
    ViewColumn({
        name: 'mobile',
    })
], CompanyViewModel.prototype, "mobile", void 0);
__decorate([
    ViewColumn({
        name: 'email',
    })
], CompanyViewModel.prototype, "email", void 0);
__decorate([
    ViewColumn({
        name: 'website',
    })
], CompanyViewModel.prototype, "website", void 0);
__decorate([
    ViewColumn({
        name: 'physical_location',
    })
], CompanyViewModel.prototype, "physicalLocation", void 0);
__decorate([
    ViewColumn({
        name: 'city',
    })
], CompanyViewModel.prototype, "city", void 0);
__decorate([
    ViewColumn({
        name: 'country',
    })
], CompanyViewModel.prototype, "country", void 0);
__decorate([
    ViewColumn({
        name: 'logo',
    })
], CompanyViewModel.prototype, "logo", void 0);
__decorate([
    ViewColumn({
        name: 'company_enabled',
    })
], CompanyViewModel.prototype, "companyEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    })
], CompanyViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'city_guid',
    })
], CompanyViewModel.prototype, "cityGuid", void 0);
__decorate([
    ViewColumn({
        name: 'county_guid',
    })
], CompanyViewModel.prototype, "countyGuid", void 0);
__decorate([
    ViewColumn({
        name: 'company_description',
    })
], CompanyViewModel.prototype, "company_description", void 0);
__decorate([
    ViewColumn({
        name: 'parent_guid',
    })
], CompanyViewModel.prototype, "parentGuid", void 0);
__decorate([
    ViewColumn({
        name: 'consumer_guid',
    })
], CompanyViewModel.prototype, "consumerGuid", void 0);
__decorate([
    ViewColumn({
        name: 'search_tags',
    })
], CompanyViewModel.prototype, "searchTags", void 0);
CompanyViewModel = __decorate([
    ViewEntity({
        name: 'company_view',
        synchronize: false,
        expression: `
    SELECT
        company.company_id AS company_id,
        company.company_guid AS company_guid,
        company.company_type_guid AS company_type_guid,
        company.directory_category_guid AS directory_category_guid,
        company.company_name AS company_name,
        company.postal_address AS postal_address,
        company.phone AS phone,
        company.mobile AS mobile,
        company.email AS email,
        company.website AS website,
        company.physical_location AS physical_location,
        company.city AS city,
        company.country AS country,
        company.logo AS logo,
        company.company_enabled AS company_enabled,
        company.doc_id AS doc_id,
        company.city_guid AS city_guid,
        company.county_guid AS county_guid,
        company.company_guid AS company_guid,
        company.company_description AS company_description,
        company.parent_guid AS parent_guid,
        company.consumer_guid AS consumer_guid,
        company.search_tags AS search_tags,
        company_type.company_type_name AS company_type_name
    FROM
        (
            company_type
            JOIN company ON ((
                company_type.company_type_guid = company.company_type_guid
        )))
    `,
    })
], CompanyViewModel);
export { CompanyViewModel };
