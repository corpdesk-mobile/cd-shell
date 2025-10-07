var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
// `cd_geo_type`.`cd_geo_type_id`,
//     `cd_geo_type`.`cd_geo_type_guid`,
//     `cd_geo_type`.`cd_geo_type_name`,
//     `cd_geo_type`.`cd_geo_type_description`,
//     `cd_geo_type`.`lat`,
//     `cd_geo_type`.`long`,
//     `cd_geo_type`.`cd_geo_boundary_data`,
//     `cd_geo_type`.`doc_id`,
//     `cd_geo_type`.`cd_geo_type_guid`,
//     `cd_geo_type`.`cd_geo_political_parent`
let CdGeoTypeModel = class CdGeoTypeModel {
    cdGeoTypeId;
    cdGeoTypeGuid;
    cdGeoTypeName;
    cdGeoTypeDescription;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_type_id',
    })
], CdGeoTypeModel.prototype, "cdGeoTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_type_guid',
        length: 36,
        default: uuidv4(),
    })
], CdGeoTypeModel.prototype, "cdGeoTypeGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_type_name',
        length: 50,
        nullable: true,
    })
], CdGeoTypeModel.prototype, "cdGeoTypeName", void 0);
__decorate([
    Column({
        name: 'cd_geo_type_description',
        length: 60,
        default: null,
    })
], CdGeoTypeModel.prototype, "cdGeoTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CdGeoTypeModel.prototype, "docId", void 0);
CdGeoTypeModel = __decorate([
    Entity({
        name: 'cd_geo_type',
        synchronize: false,
    })
], CdGeoTypeModel);
export { CdGeoTypeModel };
