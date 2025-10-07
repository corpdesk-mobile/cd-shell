var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
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
    cdGeoTrackId;
    cdGeoTrackGuid;
    cdGeoTrackName;
    cdGeoTrackDescription;
    docId;
    lat;
    long;
    placeId;
    // timestampMs
    timestampMs;
    // accuracy
    accuracy;
    // cd_obj_type_id
    cdObjType_id;
    // cd_obj_id
    cdObjId;
    // t
    t;
    // mitch_id
    mitchId;
    // un
    un;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_track_id',
    })
], CdGeoTrackModel.prototype, "cdGeoTrackId", void 0);
__decorate([
    Column({
        name: 'cd_geo_track_guid',
        length: 36,
        default: uuidv4(),
    })
], CdGeoTrackModel.prototype, "cdGeoTrackGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_track_name',
        length: 50,
        nullable: true,
    })
], CdGeoTrackModel.prototype, "cdGeoTrackName", void 0);
__decorate([
    Column({
        name: 'cd_geo_track_description',
        length: 60,
        default: null,
    })
], CdGeoTrackModel.prototype, "cdGeoTrackDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CdGeoTrackModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'lat',
        default: null,
    })
], CdGeoTrackModel.prototype, "lat", void 0);
__decorate([
    Column({
        name: 'long',
        default: null,
    })
], CdGeoTrackModel.prototype, "long", void 0);
__decorate([
    Column({
        name: 'place_id',
        default: null,
    })
], CdGeoTrackModel.prototype, "placeId", void 0);
__decorate([
    Column({
        name: 'timestampMs',
    })
], CdGeoTrackModel.prototype, "timestampMs", void 0);
__decorate([
    Column({
        name: 'accuracy',
        default: null,
    })
], CdGeoTrackModel.prototype, "accuracy", void 0);
__decorate([
    Column({
        name: 'cd_obj_type_id',
        default: null,
    })
], CdGeoTrackModel.prototype, "cdObjType_id", void 0);
__decorate([
    Column({
        name: 'cd_obj_id',
        default: null,
    })
], CdGeoTrackModel.prototype, "cdObjId", void 0);
__decorate([
    Column({
        name: 't',
    })
], CdGeoTrackModel.prototype, "t", void 0);
__decorate([
    Column({
        name: 'mitch_id',
        default: null,
    })
], CdGeoTrackModel.prototype, "mitchId", void 0);
__decorate([
    Column({
        name: 'un',
    })
], CdGeoTrackModel.prototype, "un", void 0);
CdGeoTrackModel = __decorate([
    Entity({
        name: 'cd_geo_track',
        synchronize: false,
    })
], CdGeoTrackModel);
export { CdGeoTrackModel };
