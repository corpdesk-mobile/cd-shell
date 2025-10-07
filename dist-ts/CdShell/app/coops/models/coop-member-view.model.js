var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ViewEntity, ViewColumn } from 'typeorm';
let CoopMemberViewModel = class CoopMemberViewModel {
    coopMemberId;
    coopMemberGuid;
    coopMemberName;
    coopMemberEnabled;
    coopMemberTypeId;
    coopMemberTypeGuid;
    coopActive;
    coopMemberProfile;
    userId;
    userGuid;
    userName;
    email;
    mobile;
    gender;
    birthDate;
    postalAddr;
    fName;
    mName;
    lName;
    nationalId;
    passportId;
    userEnabled;
    zipCode;
    activationKey;
    userTypeId;
    coopId;
    coopGuid;
    coopName;
    companyId;
    companyName;
    companyTypeId;
    cdGeoLocationId;
    cdGeoLocationName;
    cdGeoPoliticalTypeName;
    cdGeoPoliticalParentId;
};
__decorate([
    ViewColumn({ name: 'coop_member_id' })
], CoopMemberViewModel.prototype, "coopMemberId", void 0);
__decorate([
    ViewColumn({ name: 'coop_member_guid' })
], CoopMemberViewModel.prototype, "coopMemberGuid", void 0);
__decorate([
    ViewColumn({ name: 'coop_member_name' })
], CoopMemberViewModel.prototype, "coopMemberName", void 0);
__decorate([
    ViewColumn({ name: 'coop_member_enabled' })
], CoopMemberViewModel.prototype, "coopMemberEnabled", void 0);
__decorate([
    ViewColumn({ name: 'coop_member_type_id' })
], CoopMemberViewModel.prototype, "coopMemberTypeId", void 0);
__decorate([
    ViewColumn({ name: 'coop_member_type_guid' })
], CoopMemberViewModel.prototype, "coopMemberTypeGuid", void 0);
__decorate([
    ViewColumn({ name: 'coop_active' })
], CoopMemberViewModel.prototype, "coopActive", void 0);
__decorate([
    ViewColumn({ name: 'coop_member_profile' })
], CoopMemberViewModel.prototype, "coopMemberProfile", void 0);
__decorate([
    ViewColumn({ name: 'user_id' })
], CoopMemberViewModel.prototype, "userId", void 0);
__decorate([
    ViewColumn({ name: 'user_guid' })
], CoopMemberViewModel.prototype, "userGuid", void 0);
__decorate([
    ViewColumn({ name: 'user_name' })
], CoopMemberViewModel.prototype, "userName", void 0);
__decorate([
    ViewColumn({ name: 'email' })
], CoopMemberViewModel.prototype, "email", void 0);
__decorate([
    ViewColumn({ name: 'mobile' })
], CoopMemberViewModel.prototype, "mobile", void 0);
__decorate([
    ViewColumn({ name: 'gender' })
], CoopMemberViewModel.prototype, "gender", void 0);
__decorate([
    ViewColumn({ name: 'birth_date' })
], CoopMemberViewModel.prototype, "birthDate", void 0);
__decorate([
    ViewColumn({ name: 'postal_addr' })
], CoopMemberViewModel.prototype, "postalAddr", void 0);
__decorate([
    ViewColumn({ name: 'f_name' })
], CoopMemberViewModel.prototype, "fName", void 0);
__decorate([
    ViewColumn({ name: 'm_name' })
], CoopMemberViewModel.prototype, "mName", void 0);
__decorate([
    ViewColumn({ name: 'l_name' })
], CoopMemberViewModel.prototype, "lName", void 0);
__decorate([
    ViewColumn({ name: 'national_id' })
], CoopMemberViewModel.prototype, "nationalId", void 0);
__decorate([
    ViewColumn({ name: 'passport_id' })
], CoopMemberViewModel.prototype, "passportId", void 0);
__decorate([
    ViewColumn({ name: 'user_enabled' })
], CoopMemberViewModel.prototype, "userEnabled", void 0);
__decorate([
    ViewColumn({ name: 'zip_code' })
], CoopMemberViewModel.prototype, "zipCode", void 0);
__decorate([
    ViewColumn({ name: 'activation_key' })
], CoopMemberViewModel.prototype, "activationKey", void 0);
__decorate([
    ViewColumn({ name: 'user_type_id' })
], CoopMemberViewModel.prototype, "userTypeId", void 0);
__decorate([
    ViewColumn({ name: 'coop_id' })
], CoopMemberViewModel.prototype, "coopId", void 0);
__decorate([
    ViewColumn({ name: 'coop_guid' })
], CoopMemberViewModel.prototype, "coopGuid", void 0);
__decorate([
    ViewColumn({ name: 'coop_name' })
], CoopMemberViewModel.prototype, "coopName", void 0);
__decorate([
    ViewColumn({ name: 'company_id' })
], CoopMemberViewModel.prototype, "companyId", void 0);
__decorate([
    ViewColumn({ name: 'company_name' })
], CoopMemberViewModel.prototype, "companyName", void 0);
__decorate([
    ViewColumn({ name: 'company_type_id' })
], CoopMemberViewModel.prototype, "companyTypeId", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_id' })
], CoopMemberViewModel.prototype, "cdGeoLocationId", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_location_name' })
], CoopMemberViewModel.prototype, "cdGeoLocationName", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_political_type_name' })
], CoopMemberViewModel.prototype, "cdGeoPoliticalTypeName", void 0);
__decorate([
    ViewColumn({ name: 'cd_geo_political_parent_id' })
], CoopMemberViewModel.prototype, "cdGeoPoliticalParentId", void 0);
CoopMemberViewModel = __decorate([
    ViewEntity({
        name: 'coop_member_view',
        synchronize: false,
        expression: `
        SELECT 
            'coop_member'.'coop_member_id' AS 'coop_member_id',
            'coop_member'.'coop_member_guid' AS 'coop_member_guid',
            'coop_member'.'coop_member_name' AS 'coop_member_name',
            'coop_member'.'coop_active' AS 'coop_active',
            'coop_member'.'coop_member_enabled' AS 'coop_member_enabled',
            'coop_member'.'coop_member_profile' AS 'coop_member_profile',
            'coop_member_type'.'coop_member_type_id' AS 'coop_member_type_id',
            'coop_member_type'.'coop_member_type_guid' AS 'coop_member_type_guid',
            'user'.'user_id' AS 'user_id',
            'user'.'user_guid' AS 'user_guid',
            'user'.'user_name' AS 'user_name',
            'user'.'email' AS 'email',
            'user'.'mobile' AS 'mobile',
            'user'.'gender' AS 'gender',
            'user'.'birth_date' AS 'birth_date',
            'user'.'postal_addr' AS 'postal_addr',
            'user'.'f_name' AS 'f_name',
            'user'.'m_name' AS 'm_name',
            'user'.'l_name' AS 'l_name',
            'user'.'national_id' AS 'national_id',
            'user'.'passport_id' AS 'passport_id',
            'user'.'user_enabled' AS 'user_enabled',
            'user'.'zip_code' AS 'zip_code',
            'user'.'activation_key' AS 'activation_key',
            'user'.'user_type_id' AS 'user_type_id',
            'coop_view'.'coop_id' AS 'coop_id',
            'coop_view'.'coop_guid' AS 'coop_guid',
            'coop_view'.'coop_name' AS 'coop_name',
            'coop_view'.'company_id' AS 'company_id',
            'coop_view'.'company_name' AS 'company_name',
            'coop_view'.'company_type_id' AS 'company_type_id',
            'coop_view'.'cd_geo_location_id' AS 'cd_geo_location_id',
            'coop_view'.'cd_geo_location_name' AS 'cd_geo_location_name',
            'coop_view'.'cd_geo_political_type_name' AS 'cd_geo_political_type_name',
            'coop_view'.'cd_geo_political_parent_id' AS 'cd_geo_political_parent_id'
        FROM
            'coop_member'
            JOIN 'user' ON 'coop_member'.'user_id' = 'user'.'user_id'
            JOIN 'coop_member_type' ON 'coop_member'.'coop_member_type_id' = 'coop_member_type'.'coop_member_type_id'
            JOIN 'coop_view' ON 'coop_member'.'coop_id' = 'coop_view'.'coop_id'
    `
    })
], CoopMemberViewModel);
export { CoopMemberViewModel };
