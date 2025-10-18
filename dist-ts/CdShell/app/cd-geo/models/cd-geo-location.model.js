var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn, Unique } from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from 'uuid';
let CdGeoLocationModel = class CdGeoLocationModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_location_id',
    }),
    __metadata("design:type", Number)
], CdGeoLocationModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationName", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_description',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoLocationModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'lat',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoLocationModel.prototype, "lat", void 0);
__decorate([
    Column({
        name: 'long',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoLocationModel.prototype, "long", void 0);
__decorate([
    Column({
        name: 'cd_geo_boundary_data',
        type: 'json',
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoBoundaryData", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_code',
        length: 10,
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationCode", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_icon',
        type: 'json',
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationIcon", void 0);
__decorate([
    Column({
        name: 'back4app_obectId',
        length: 10,
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "back4appObectId", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoLocationModel.prototype, "cdGeoPoliticalTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_parent_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoLocationModel.prototype, "cdGeoPoliticalParentId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_name_alt',
        type: 'json',
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationNameAlt", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_assoc',
        type: 'json',
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationAssoc", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_population',
        type: 'json',
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoLocationModel.prototype, "cdGeoLocationPopulation", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_enabled',
        default: null,
    }),
    __metadata("design:type", Boolean)
], CdGeoLocationModel.prototype, "cdGeoLocationEnabled", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_display',
        default: null,
    }),
    __metadata("design:type", Boolean)
], CdGeoLocationModel.prototype, "cdGeoLocationDisplay", void 0);
CdGeoLocationModel = __decorate([
    Entity({
        name: 'cd_geo_location',
        synchronize: false,
    }),
    Unique(['cdGeoLocationName', 'cdGeoLocationCode'])
], CdGeoLocationModel);
export { CdGeoLocationModel };
export const cdGeoPoliticalTypes = [
    {
        cd_geo_political_type_id: 1,
        cd_geo_political_type_name: 'town',
    },
    {
        cd_geo_political_type_id: 2,
        cd_geo_political_type_name: 'city',
    },
    {
        cd_geo_political_type_id: 3,
        cd_geo_political_type_name: 'sub-location',
    },
    {
        cd_geo_political_type_id: 4,
        cd_geo_political_type_name: 'location',
    },
    {
        cd_geo_political_type_id: 5,
        cd_geo_political_type_name: 'county',
    },
    {
        cd_geo_political_type_id: 6,
        cd_geo_political_type_name: 'district',
    },
    {
        cd_geo_political_type_id: 7,
        cd_geo_political_type_name: 'sub-district',
    },
    {
        cd_geo_political_type_id: 8,
        cd_geo_political_type_name: 'province',
    },
    {
        cd_geo_political_type_id: 9,
        cd_geo_political_type_name: 'state',
    },
    {
        cd_geo_political_type_id: 10,
        cd_geo_political_type_name: 'country',
    },
    {
        cd_geo_political_type_id: 11,
        cd_geo_political_type_name: 'continent',
    },
    {
        cd_geo_political_type_id: 12,
        cd_geo_political_type_name: 'continental-region',
    },
    {
        cd_geo_political_type_id: 13,
        cd_geo_political_type_name: 'canton',
    },
    {
        cd_geo_political_type_id: 14,
        cd_geo_political_type_name: 'division',
    },
    {
        cd_geo_political_type_id: 15,
        cd_geo_political_type_name: 'narional-region',
    },
    {
        cd_geo_political_type_id: 16,
        cd_geo_political_type_name: 'region',
    },
    {
        cd_geo_political_type_id: 17,
        cd_geo_political_type_name: 'administrative-capital-city',
    },
    {
        cd_geo_political_type_id: 18,
        cd_geo_political_type_name: 'business-capital-city',
    },
    {
        cd_geo_political_type_id: 19,
        cd_geo_political_type_name: 'world-globe',
    },
];
