var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, Column, PrimaryColumn } from 'typeorm';
let CdGeoLocationViewModel = class CdGeoLocationViewModel {
    cdGeoLocationId;
    cdGeoLocationGuid;
    cdGeoLocationName;
    cdGeoLocationDescription;
    lat;
    long;
    cdGeoBoundaryData;
    docId;
    cdGeoLocationCode;
    cdGeoLocationIcon;
    back4appObectId;
    cdGeoPoliticalTypeId;
    cdGeoPoliticalParentId;
    cdGeoLocationNameAlt;
    geoBoundaryData;
    cdGeoLocationEnabled;
    cdGeoLocationAssoc;
    cdGeoLocationPopulation;
    cdGeoLocationDisplay;
    cdGeoPoliticalTypeGuid;
    cdGeoPoliticalTypeName;
    cdGeoPoliticalTypeDescription;
};
__decorate([
    PrimaryColumn({
        name: 'cd_geo_location_id',
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_guid',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_name',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationName", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_description',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationDescription", void 0);
__decorate([
    Column({
        name: 'lat',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "lat", void 0);
__decorate([
    Column({
        name: 'long',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "long", void 0);
__decorate([
    Column({
        name: 'cd_geo_boundary_data',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoBoundaryData", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_code',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationCode", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_icon',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationIcon", void 0);
__decorate([
    Column({
        name: 'back4app_obectId',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "back4appObectId", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_id',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_parent_id',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalParentId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_name_alt',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationNameAlt", void 0);
__decorate([
    Column({
        name: 'geo_boundary_data',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "geoBoundaryData", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_enabled',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationEnabled", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_assoc',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationAssoc", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_population',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationPopulation", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_display',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoLocationDisplay", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_guid',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_name',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeName", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_description',
        nullable: true,
    })
], CdGeoLocationViewModel.prototype, "cdGeoPoliticalTypeDescription", void 0);
CdGeoLocationViewModel = __decorate([
    Entity({
        name: 'cd_geo_location_view',
        synchronize: false,
    })
], CdGeoLocationViewModel);
export { CdGeoLocationViewModel };
