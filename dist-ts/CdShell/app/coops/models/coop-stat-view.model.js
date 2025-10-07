var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ViewEntity, ViewColumn } from 'typeorm';
// export function siGet(q: IQuery) {
//   return {
//     serviceModel: CoopStatViewModel,
//     docName: 'CoopStatModel::siGet',
//     cmd: {
//       action: 'find',
//       query: q,
//     },
//     dSource: 1,
//   };
// }
let CoopStatViewModel = class CoopStatViewModel {
    coopStatId;
    coopStatGuid;
    coopStatName;
    coopTypeGuid;
    coopTypeName;
    docId;
    coopStatDescription;
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
    parentGuid;
    cdGeoLocationName;
    cdGeoPoliticalTypeId;
    coopStatEnabled;
    coopStatDisplay;
    coopStatRefId;
    cdGeoLocationEnabled;
    cdGeoLocationDisplay;
};
__decorate([
    ViewColumn({
        name: 'coop_stat_id',
    })
], CoopStatViewModel.prototype, "coopStatId", void 0);
__decorate([
    ViewColumn({
        name: 'coop_stat_guid',
    })
], CoopStatViewModel.prototype, "coopStatGuid", void 0);
__decorate([
    ViewColumn({
        name: 'coop_stat_name',
    })
], CoopStatViewModel.prototype, "coopStatName", void 0);
__decorate([
    ViewColumn({
        name: 'coop_type_guid',
    })
], CoopStatViewModel.prototype, "coopTypeGuid", void 0);
__decorate([
    ViewColumn({
        name: 'coop_type_name',
    })
], CoopStatViewModel.prototype, "coopTypeName", void 0);
__decorate([
    ViewColumn({
        name: 'doc_id',
    })
], CoopStatViewModel.prototype, "docId", void 0);
__decorate([
    ViewColumn({
        name: 'coop_stat_description',
    })
], CoopStatViewModel.prototype, "coopStatDescription", void 0);
__decorate([
    ViewColumn({
        name: 'coop_type_id',
    })
], CoopStatViewModel.prototype, "coopTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'cd_geo_location_id',
    })
], CoopStatViewModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    ViewColumn({
        name: 'coop_count',
    })
], CoopStatViewModel.prototype, "coopCount", void 0);
__decorate([
    ViewColumn({
        name: 'coop_members_count',
    })
], CoopStatViewModel.prototype, "coopMembersCount", void 0);
__decorate([
    ViewColumn({
        name: 'coop_saves_shares',
    })
], CoopStatViewModel.prototype, "coopSavesShares", void 0);
__decorate([
    ViewColumn({
        name: 'coop_loans',
    })
], CoopStatViewModel.prototype, "coopLoans", void 0);
__decorate([
    ViewColumn({
        name: 'coop_assets',
    })
], CoopStatViewModel.prototype, "coopAssets", void 0);
__decorate([
    ViewColumn({
        name: 'coop_member_penetration',
    })
], CoopStatViewModel.prototype, "coopMemberPenetration", void 0);
__decorate([
    ViewColumn({
        name: 'coop_stat_date_label',
    })
], CoopStatViewModel.prototype, "coopStatDateLabel", void 0);
__decorate([
    ViewColumn({
        name: 'coop_woccu',
    })
], CoopStatViewModel.prototype, "coopWoccu", void 0);
__decorate([
    ViewColumn({
        name: 'coop_reserves',
    })
], CoopStatViewModel.prototype, "coopReserves", void 0);
__decorate([
    ViewColumn({
        name: 'parent_guid',
    })
], CoopStatViewModel.prototype, "parentGuid", void 0);
__decorate([
    ViewColumn({
        name: 'cd_geo_location_name',
    })
], CoopStatViewModel.prototype, "cdGeoLocationName", void 0);
__decorate([
    ViewColumn({
        name: 'cd_geo_political_type_id',
    })
], CoopStatViewModel.prototype, "cdGeoPoliticalTypeId", void 0);
__decorate([
    ViewColumn({
        name: 'coop_stat_enabled',
    })
], CoopStatViewModel.prototype, "coopStatEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'coop_stat_display',
    })
], CoopStatViewModel.prototype, "coopStatDisplay", void 0);
__decorate([
    ViewColumn({
        name: 'coop_stat_ref_id',
    })
], CoopStatViewModel.prototype, "coopStatRefId", void 0);
__decorate([
    ViewColumn({
        name: 'cd_geo_location_enabled',
    })
], CoopStatViewModel.prototype, "cdGeoLocationEnabled", void 0);
__decorate([
    ViewColumn({
        name: 'cd_geo_location_display',
    })
], CoopStatViewModel.prototype, "cdGeoLocationDisplay", void 0);
CoopStatViewModel = __decorate([
    ViewEntity({
        name: 'coop_stat_view',
        synchronize: false,
        expression: `
    SELECT 
        'coop_stat'.'coop_stat_id' AS 'coop_id',
        'coop_stat'.'coop_stat_guid' AS 'coop_guid',
        'coop_stat'.'coop_stat_name' AS 'coop_name',
        'coop_stat'.'coop_stat_description' AS 'coop_description',
        'coop_stat'.'doc_id' AS 'doc_id',
        'coop_stat'.'coop_type_id' AS 'coop_type_id',
        'coop_stat'.'cd_geo_location_id' AS 'cd_geo_location_id',
        'coop_stat'.'coop_count' AS 'coop_count',
        'coop_stat'.'coop_members_count' AS 'coop_members_count',
        'coop_stat'.'coop_saves_shares' AS 'coop_saves_shares',
        'coop_stat'.'coop_loans' AS 'coop_loans',
        'coop_stat'.'coop_assets' AS 'coop_assets',
        'coop_stat'.'coop_member_penetration' AS 'coop_member_penetration',
        'coop_stat'.'coop_stat_date_label' AS 'coop_date_label',
        'coop_stat'.'coop_woccu' AS 'coop_woccu',
        'coop_stat'.'coop_reserves' AS 'coop_reserves',
        'coop_stat'.'coop_stat_enabled' AS 'coop_enabled',
        'coop_stat'.'coop_stat_display' AS 'coop_display',
        'coop_stat'.'coop_stat_ref_id' AS 'coop_ref_id',
        'coop_type'.'parent_guid' AS 'parent_guid',
        'coop_type'.'coop_type_name' AS 'coop_type_name',
        'cd_geo_location'.'cd_geo_location_name' AS 'cd_geo_location_name',
        'cd_geo_location'.'cd_geo_location_enabled' AS 'cd_geo_location_enabled',
        'cd_geo_location'.'cd_geo_location_display' AS 'cd_geo_location_display',
        'cd_geo_location'.'cd_geo_political_type_id' AS 'cd_geo_political_type_id'
    FROM
        (('coop_stat'
        JOIN 'coop_type' ON (('coop_type'.'coop_type_id' = 'coop_stat'.'coop_type_id')))
        JOIN 'cd_geo_location' ON (('cd_geo_location'.'cd_geo_location_id' = 'coop_stat'.'cd_geo_location_id')))
    `,
    })
], CoopStatViewModel);
export { CoopStatViewModel };
