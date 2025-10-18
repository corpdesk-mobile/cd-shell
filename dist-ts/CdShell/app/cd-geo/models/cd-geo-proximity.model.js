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
import { v4 as uuidv4 } from 'uuid';
// `cd_geo_proximity`.`cd_geo_proximity_id`,
//     `cd_geo_proximity`.`cd_geo_proximity_guid`,
//     `cd_geo_proximity`.`cd_geo_proximity_name`,
//     `cd_geo_proximity`.`cd_geo_proximity_description`,
//     `cd_geo_proximity`.`lat`,
//     `cd_geo_proximity`.`long`,
//     `cd_geo_proximity`.`cd_geo_boundary_data`,
//     `cd_geo_proximity`.`doc_id`,
//     `cd_geo_proximity`.`cd_geo_proximity_guid`,
//     `cd_geo_proximity`.`cd_geo_political_parent`
let CdGeoProximityModel = class CdGeoProximityModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_proximity_id',
    }),
    __metadata("design:type", Number)
], CdGeoProximityModel.prototype, "cdGeoProximityId", void 0);
__decorate([
    Column({
        name: 'cd_geo_proximity_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], CdGeoProximityModel.prototype, "cdGeoProximityGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_proximity_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoProximityModel.prototype, "cdGeoProximityName", void 0);
__decorate([
    Column({
        name: 'cd_geo_proximity_description',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoProximityModel.prototype, "cdGeoProximityDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoProximityModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'cd_geo_proximity_data',
        type: 'json',
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoProximityModel.prototype, "cdGeoProximityData", void 0);
CdGeoProximityModel = __decorate([
    Entity({
        name: 'cd_geo_proximity',
        synchronize: false,
    })
], CdGeoProximityModel);
export { CdGeoProximityModel };
