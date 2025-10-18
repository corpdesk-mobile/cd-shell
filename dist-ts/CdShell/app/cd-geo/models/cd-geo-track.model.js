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
// `cd_geo_track`.`cd_geo_track_id`,
//     `cd_geo_track`.`lat`,
//     `cd_geo_track`.`long`,
//     `cd_geo_track`.`place_id`,
//     `cd_geo_track`.`timestampMs`,
//     `cd_geo_track`.`accuracy`,
//     `cd_geo_track`.`cd_obj_type_id`,
//     `cd_geo_track`.`cd_obj_id`,
//     `cd_geo_track`.`t`,
//     `cd_geo_track`.`mitch_id`,
//     `cd_geo_track`.`un`,
//     `cd_geo_track`.`doc_id`,
//     `cd_geo_track`.`cd_geo_track_guid`
let CdGeoTrackModel = class CdGeoTrackModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_track_id',
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "cdGeoTrackId", void 0);
__decorate([
    Column({
        name: 'cd_geo_track_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], CdGeoTrackModel.prototype, "cdGeoTrackGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_track_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoTrackModel.prototype, "cdGeoTrackName", void 0);
__decorate([
    Column({
        name: 'cd_geo_track_description',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], CdGeoTrackModel.prototype, "cdGeoTrackDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'lat',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "lat", void 0);
__decorate([
    Column({
        name: 'long',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "long", void 0);
__decorate([
    Column({
        name: 'place_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "placeId", void 0);
__decorate([
    Column({
        name: 'timestampMs',
    }),
    __metadata("design:type", String)
], CdGeoTrackModel.prototype, "timestampMs", void 0);
__decorate([
    Column({
        name: 'accuracy',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "accuracy", void 0);
__decorate([
    Column({
        name: 'cd_obj_type_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "cdObjType_id", void 0);
__decorate([
    Column({
        name: 'cd_obj_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "cdObjId", void 0);
__decorate([
    Column({
        name: 't',
    }),
    __metadata("design:type", String)
], CdGeoTrackModel.prototype, "t", void 0);
__decorate([
    Column({
        name: 'mitch_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoTrackModel.prototype, "mitchId", void 0);
__decorate([
    Column({
        name: 'un',
    }),
    __metadata("design:type", String)
], CdGeoTrackModel.prototype, "un", void 0);
CdGeoTrackModel = __decorate([
    Entity({
        name: 'cd_geo_track',
        synchronize: false,
    })
], CdGeoTrackModel);
export { CdGeoTrackModel };
