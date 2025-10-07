var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let CoopModel = class CoopModel {
    coopId;
    coopGuid;
    coopName;
    coopDescription;
    docId;
    coopTypeId;
    companyId;
    /**
     * this is the geo-scope of a given coop...or SACCO or Credit Union
     */
    cdGeoLocationId;
    coopEnabled;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'coop_id',
    })
], CoopModel.prototype, "coopId", void 0);
__decorate([
    Column({
        name: 'coop_guid',
        length: 36,
        default: uuidv4(),
    })
], CoopModel.prototype, "coopGuid", void 0);
__decorate([
    Column({
        name: 'coop_name',
        length: 50,
        nullable: true,
    })
], CoopModel.prototype, "coopName", void 0);
__decorate([
    Column({
        name: 'coop_description',
        length: 60,
        default: null,
    })
], CoopModel.prototype, "coopDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CoopModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'coop_type_id',
        default: null,
    })
], CoopModel.prototype, "coopTypeId", void 0);
__decorate([
    Column({
        name: 'company_id',
        default: null,
    })
], CoopModel.prototype, "companyId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_id',
        default: null,
    })
], CoopModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    Column('boolean', {
        name: 'coop_enabled',
        default: null,
    })
], CoopModel.prototype, "coopEnabled", void 0);
CoopModel = __decorate([
    Entity({
        name: 'coop',
        synchronize: false,
    })
], CoopModel);
export { CoopModel };
