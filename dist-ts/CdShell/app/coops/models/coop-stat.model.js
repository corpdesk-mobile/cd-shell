var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ColumnNumericTransformer } from '../../../sys/base/i-base.js';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
// import { ColumnNumericTransformer } from '../../../sys/base/base.model';
let CoopStatModel = class CoopStatModel {
    coopStatId;
    coopStatGuid;
    coopStatName;
    coopStatDescription;
    docId;
    coopTypeId;
    cdGeoLocationId;
    coopCount;
    coopMembersCount;
    coopSavesShares;
    coopLoans;
    coopAssets;
    coopMemberPenetration;
    coopStatDateLabel;
    coopWoccu;
    coopReserves;
    coopStatRefId;
    coopStatEnabled;
    coopStatDisplay;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'coop_stat_id',
    })
], CoopStatModel.prototype, "coopStatId", void 0);
__decorate([
    Column({
        name: 'coop_stat_guid',
        length: 36,
        default: uuidv4(),
    })
], CoopStatModel.prototype, "coopStatGuid", void 0);
__decorate([
    Column({
        name: 'coop_stat_name',
        length: 50,
        nullable: true,
    })
], CoopStatModel.prototype, "coopStatName", void 0);
__decorate([
    Column({
        name: 'coop_stat_description',
        length: 60,
        default: null,
    })
], CoopStatModel.prototype, "coopStatDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CoopStatModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'coop_type_id',
        default: null,
    })
], CoopStatModel.prototype, "coopTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_location_id',
        default: null,
    })
], CoopStatModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    Column({
        name: 'coop_count',
        default: null,
    })
], CoopStatModel.prototype, "coopCount", void 0);
__decorate([
    Column({
        name: 'coop_members_count',
        default: null,
    })
], CoopStatModel.prototype, "coopMembersCount", void 0);
__decorate([
    Column({
        name: 'coop_saves_shares',
        default: null,
    })
], CoopStatModel.prototype, "coopSavesShares", void 0);
__decorate([
    Column({
        name: 'coop_loans',
        default: null,
    })
], CoopStatModel.prototype, "coopLoans", void 0);
__decorate([
    Column({
        name: 'coop_assets',
        default: null,
    })
], CoopStatModel.prototype, "coopAssets", void 0);
__decorate([
    Column('numeric', {
        name: 'coop_member_penetration',
        precision: 7,
        scale: 2,
        default: null,
        transformer: new ColumnNumericTransformer(),
    })
], CoopStatModel.prototype, "coopMemberPenetration", void 0);
__decorate([
    Column({
        name: 'coop_stat_date_label',
        default: null,
    })
], CoopStatModel.prototype, "coopStatDateLabel", void 0);
__decorate([
    Column('boolean', {
        name: 'coop_woccu',
        default: null,
    })
], CoopStatModel.prototype, "coopWoccu", void 0);
__decorate([
    Column({
        name: 'coop_reserves',
        default: null,
    })
], CoopStatModel.prototype, "coopReserves", void 0);
__decorate([
    Column({
        name: 'coop_stat_ref_id',
        default: null,
    })
], CoopStatModel.prototype, "coopStatRefId", void 0);
__decorate([
    Column('boolean', {
        name: 'coop_stat_enabled',
        default: null,
    })
], CoopStatModel.prototype, "coopStatEnabled", void 0);
__decorate([
    Column('boolean', {
        name: 'coop_stat_display',
        default: null,
    })
], CoopStatModel.prototype, "coopStatDisplay", void 0);
CoopStatModel = __decorate([
    Entity({
        name: 'coop_stat',
        synchronize: false,
    })
], CoopStatModel);
export { CoopStatModel };
