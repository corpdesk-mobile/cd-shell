var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { userProfileDefault, } from '../../../sys/cd-user/models/user.model.js';
// `coop_member`.`coop_member_id`,
// `coop_member`.`coop_member_guid`,
// `coop_member`.`coop_member_type_id`,
// `coop_member`.`user_id`,
// `coop_member`.`doc_id`,
// `coop_member`.`coop_member_enabled`,
// `coop_member`.`coop_id`
let CoopMemberModel = class CoopMemberModel {
    coopMemberId;
    coopMemberGuid;
    coopMemberTypeId;
    userId;
    docId;
    coopMemberEnabled;
    coopId;
    coopActive;
    coopMemberProfile;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'coop_member_id',
    })
], CoopMemberModel.prototype, "coopMemberId", void 0);
__decorate([
    Column({
        name: 'coop_member_guid',
        length: 40,
        default: uuidv4(),
    })
], CoopMemberModel.prototype, "coopMemberGuid", void 0);
__decorate([
    Column({
        name: 'coop_member_type_id',
        nullable: true,
    })
], CoopMemberModel.prototype, "coopMemberTypeId", void 0);
__decorate([
    Column({
        name: 'user_id',
        nullable: true,
    })
], CoopMemberModel.prototype, "userId", void 0);
__decorate([
    Column({
        name: 'doc_id',
        nullable: true,
    })
], CoopMemberModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'coop_member_enabled',
        nullable: true,
    })
], CoopMemberModel.prototype, "coopMemberEnabled", void 0);
__decorate([
    Column({
        name: 'coop_id',
        nullable: true,
    })
], CoopMemberModel.prototype, "coopId", void 0);
__decorate([
    Column({
        name: 'coop_active',
        nullable: true,
    })
], CoopMemberModel.prototype, "coopActive", void 0);
__decorate([
    Column({
        name: 'coop_member_profile',
        nullable: true,
    })
], CoopMemberModel.prototype, "coopMemberProfile", void 0);
CoopMemberModel = __decorate([
    Entity({
        name: 'coop_member',
        synchronize: false,
    })
    // @CdModel
], CoopMemberModel);
export { CoopMemberModel };
/**
 * Note that coop membership prrofile is an extension of user profile
 * Note that the first item is userProfile and by default has a value imported from userProfileDefault,
 * On load, date will be set from database.
 * the data below is just a default,
 * details are be managed with 'roles' features
 *
 */
export const coopMemberProfileDefault = {
    ...userProfileDefault, // Copy all properties from userProfileDefault
    coopMembership: {
        memberData: [
            {
                userName: '',
                fName: '',
                lName: '',
            },
        ],
        acl: [
            {
                coopId: -1,
                coopActive: false,
                coopRole: [{ scope: 11 /* CoopsAclScope.COOPS_GUEST */, geoLocationId: null }],
                /**
                 * specified permission setting for given members to specified fields
                 */
                aclRole: {
                    aclRoleName: 'guest',
                    permissions: {
                        userPermissions: [
                            {
                                cdObjId: 0,
                                hidden: true,
                                field: '',
                                read: false,
                                write: false,
                                execute: false,
                            },
                        ],
                        groupPermissions: [
                            {
                                cdObjId: 0,
                                hidden: true,
                                field: '',
                                read: false,
                                write: false,
                                execute: false,
                            },
                        ],
                    },
                },
            },
        ],
    },
};
