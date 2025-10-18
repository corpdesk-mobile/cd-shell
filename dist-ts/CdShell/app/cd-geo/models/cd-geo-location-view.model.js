// import { Entity, Column, PrimaryColumn } from 'typeorm';
// import { Entity, Column, PrimaryGeneratedColumn } from '../../../utils/orm-shim.js';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryColumn } from "../../../sys/utils/orm-shim";
let CdGeoLocationViewModel = class CdGeoLocationViewModel {
};
__decorate([
    PrimaryColumn({
        name: 'cd_geo_location_id',
    }),
    __metadata("design:type", Number)
], CdGeoLocationViewModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_guid',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_name',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationName", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_description',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationDescription", void 0);
__decorate([
    Column({
        name: 'lat',
        nullable: true,
    }),
    __metadata("design:type", Number)
], CdGeoLocationViewModel.prototype, "lat", void 0);
__decorate([
    Column({
        name: 'long',
        nullable: true,
    }),
    __metadata("design:type", Number)
], CdGeoLocationViewModel.prototype, "long", void 0);
__decorate([
    Column({
        name: 'cd_geo_boundary_data',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoBoundaryData", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], CdGeoLocationViewModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_code',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationCode", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_icon',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationIcon", void 0);
__decorate([
    Column({
        name: 'back4app_obectId',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "back4appObectId", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_parent_id',
        nullable: true,
    }),
    __metadata("design:type", Number)
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalParentId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_name_alt',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationNameAlt", void 0);
__decorate([
    Column({
        name: 'geo_boundary_data',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "geoBoundaryData", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_enabled',
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], CdGeoLocationViewModel.prototype, "cdGeoLocationEnabled", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_assoc',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationAssoc", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_population',
        nullable: true,
    }),
    __metadata("design:type", Number)
], CdGeoLocationViewModel.prototype, "cdGeoLocationPopulation", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_display',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoLocationDisplay", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_guid',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_name',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeName", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_description',
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeDescription", void 0);
CdGeoLocationViewModel = __decorate([
    Entity({
        name: 'cd_geo_location_view',
        synchronize: false,
    })
], CdGeoLocationViewModel);
export { CdGeoLocationViewModel };
