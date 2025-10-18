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
// export function siGet(q: IQuery) {
//   return {
//     serviceModel: CoopViewModel,
//     docName: 'CoopModel::siGet',
//     cmd: {
//       action: 'find',
//       query: q,
//     },
//     dSource: 1,
//   };
// }
let CoopViewModel = class CoopViewModel {
};
__decorate([
    ViewColumn({ name: 'coop_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "coopId", void 0);
__decorate([
    ViewColumn({ name: 'coop_name' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "coopName", void 0);
__decorate([
    ViewColumn({ name: 'coop_description' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "coopDescription", void 0);
__decorate([
    ViewColumn({ name: 'coop_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "coopGuid", void 0);
__decorate([
    ViewColumn({ name: 'coop_type_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "coopTypeId", void 0);
__decorate([
    ViewColumn({ name: 'coop_enabled' }),
    __metadata("design:type", Boolean)
], CoopViewModel.prototype, "coopEnabled", void 0);
__decorate([
    ViewColumn({ name: 'coop_type_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "coopTypeGuid", void 0);
__decorate([
    ViewColumn({ name: 'company_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "companyId", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    ViewColumn({ name: 'company_type_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "companyTypeId", void 0);
__decorate([
    ViewColumn({ name: 'company_type_name' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "companyTypeName", void 0);
__decorate([
    ViewColumn({ name: 'directory_category_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "directoryCategoryGuid", void 0);
__decorate([
    ViewColumn({ name: 'company_name' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "companyName", void 0);
__decorate([
    ViewColumn({ name: 'postal_address' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "postalAddress", void 0);
__decorate([
    ViewColumn({ name: 'phone' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "phone", void 0);
__decorate([
    ViewColumn({ name: 'email' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "email", void 0);
__decorate([
    ViewColumn({ name: 'website' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "website", void 0);
__decorate([
    ViewColumn({ name: 'physical_location' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "physicalLocation", void 0);
__decorate([
    ViewColumn({ name: 'city' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "city", void 0);
__decorate([
    ViewColumn({ name: 'country' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "country", void 0);
__decorate([
    ViewColumn({ name: 'logo' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "logo", void 0);
__decorate([
    ViewColumn({ name: 'company_enabled' }),
    __metadata("design:type", Boolean)
], CoopViewModel.prototype, "companyEnabled", void 0);
__decorate([
    ViewColumn({ name: 'doc_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({ name: 'city_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cityGuid", void 0);
__decorate([
    ViewColumn({ name: 'county_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "countyGuid", void 0);
__decorate([
    ViewColumn({ name: 'company_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "companyGuid", void 0);
__decorate([
    ViewColumn({ name: 'company_description' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "companyDescription", void 0);
__decorate([
    ViewColumn({ name: 'parent_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "parentGuid", void 0);
__decorate([
    ViewColumn({ name: 'consumer_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "consumerId", void 0);
__decorate([
    ViewColumn({ name: 'mobile' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "mobile", void 0);
__decorate([
    ViewColumn({ name: 'company_type_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "companyTypeGuid", void 0);
__decorate([
    ViewColumn({ name: 'consumer_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "consumerGuid", void 0);
__decorate([
    ViewColumn({ name: 'search_tags' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "searchTags", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationGuid", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_name' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationName", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_description' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationDescription", void 0);
__decorate([
    ViewColumn({ name: 'lat' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "lat", void 0);
__decorate([
    ViewColumn({ name: 'long' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "long", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_boundary_data' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoBoundaryData", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_code' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationCode", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_icon' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationIcon", void 0);
__decorate([
    ViewColumn({ name: 'back4app_obectId' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "back4appObjectId", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_political_type_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "cdGeoPoliticalTypeId", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_political_parent_id' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "cdGeoPoliticalParentId", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_name_alt' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationNameAlt", void 0);
__decorate([
    ViewColumn({ name: 'geo_boundary_data' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "geoBoundaryData", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_enabled' }),
    __metadata("design:type", Boolean)
], CoopViewModel.prototype, "cdGeoLocationEnabled", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_assoc' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationAssoc", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_population' }),
    __metadata("design:type", Number)
], CoopViewModel.prototype, "cdGeoLocationPopulation", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_display' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoLocationDisplay", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_political_type_guid' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoPoliticalTypeGuid", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_political_type_name' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoPoliticalTypeName", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_political_type_description' }),
    __metadata("design:type", String)
], CoopViewModel.prototype, "cdGeoPoliticalTypeDescription", void 0);
CoopViewModel = __decorate([
    ViewEntity({
        name: 'coop_view',
        synchronize: false,
        expression: `
    SELECT
            'coop'.'coop_id',
            'coop'.'coop_name',
            'coop'.'coop_description',
            'coop'.'coop_guid',
            'coop'.'coop_type_id',
            'coop'.'coop_enabled',
            'coop'.'company_id',
            'coop'.'cd_geo_location_id',
            'coop_type'.'coop_type_guid',
            'company'.'company_type_id',
            'company'.'company_type_name',
            'company'.'directory_category_guid',
            'company'.'company_name',
            'company'.'postal_address',
            'company'.'phone',
            'company'.'email',
            'company'.'website',
            'company'.'physical_location',
            'company'.'city',
            'company'.'country',
            'company'.'logo',
            'company'.'company_enabled',
            'company'.'doc_id',
            'company'.'city_guid',
            'company'.'county_guid',
            'company'.'company_guid',
            'company'.'company_description',
            'company'.'parent_guid',
            'company'.'consumer_id',
            'company'.'mobile',
            'company'.'company_type_guid',
            'company'.'consumer_guid',
            'company'.'search_tags',
            'cd_geo_location_view'.'cd_geo_location_guid',
            'cd_geo_location_view'.'cd_geo_location_name',
            'cd_geo_location_view'.'cd_geo_location_description',
            'cd_geo_location_view'.'lat',
            'cd_geo_location_view'.'long',
            'cd_geo_location_view'.'cd_geo_boundary_data',
            'cd_geo_location_view'.'cd_geo_location_code',
            'cd_geo_location_view'.'cd_geo_location_icon',
            'cd_geo_location_view'.'back4app_obectId',
            'cd_geo_location_view'.'cd_geo_political_type_id',
            'cd_geo_location_view'.'cd_geo_political_parent_id',
            'cd_geo_location_view'.'cd_geo_location_name_alt',
            'cd_geo_location_view'.'geo_boundary_data',
            'cd_geo_location_view'.'cd_geo_location_enabled',
            'cd_geo_location_view'.'cd_geo_location_assoc',
            'cd_geo_location_view'.'cd_geo_location_population',
            'cd_geo_location_view'.'cd_geo_location_display',
            'cd_geo_location_view'.'cd_geo_political_type_guid',
            'cd_geo_location_view'.'cd_geo_political_type_name',
            'cd_geo_location_view'.'cd_geo_political_type_description'
        FROM
            coop
        JOIN
            company ON coop.company_id = company.company_id
        JOIN
            company_type ON company.company_type_id = company_type.company_type_id
        JOIN
            cd_geo_location_view cd_geo_location_view ON coop.cd_geo_location_id = cd_geo_location_view.cd_geo_location_id;
    `,
    })
], CoopViewModel);
export { CoopViewModel };
