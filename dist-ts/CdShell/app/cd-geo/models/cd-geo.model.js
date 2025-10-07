var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
// `cd_geo_`.`cd_geo_id`,
//     `cd_geo_`.`cd_geo_guid`,
//     `cd_geo_`.`cd_geo_name`,
//     `cd_geo_`.`cd_geo_description`,
//     `cd_geo_`.`lat`,
//     `cd_geo_`.`long`,
//     `cd_geo_`.`cd_geo_boundary_data`,
//     `cd_geo_`.`doc_id`,
//     `cd_geo_`.`cd_geo_guid`,
//     `cd_geo_`.`cd_geo_political_parent`
let CdGeoModel = class CdGeoModel {
    cdGeoId;
    cdGeoGuid;
    cdGeoName;
    cdGeoDescription;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_id',
    })
], CdGeoModel.prototype, "cdGeoId", void 0);
__decorate([
    Column({
        name: 'cd_geo_guid',
        length: 36,
        default: uuidv4(),
    })
], CdGeoModel.prototype, "cdGeoGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_name',
        length: 50,
        nullable: true,
    })
], CdGeoModel.prototype, "cdGeoName", void 0);
__decorate([
    Column({
        name: 'cd_geo_description',
        length: 60,
        default: null,
    })
], CdGeoModel.prototype, "cdGeoDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CdGeoModel.prototype, "docId", void 0);
CdGeoModel = __decorate([
    Entity({
        name: 'cd_geo_',
        synchronize: false,
    })
], CdGeoModel);
export { CdGeoModel };
