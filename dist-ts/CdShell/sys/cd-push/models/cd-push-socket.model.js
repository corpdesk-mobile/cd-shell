var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// SELECT cd_push_socket_id, cd_push_socket_guid, cd_push_socket_name, cd_push_socket_description, doc_id, cd_push_socket_type_id, `data`
// FROM cd1213.cd_push_socket;
let CdPushSocketModel = class CdPushSocketModel {
    cdPushSocketId;
    cdPushSocketGuid;
    cdPushSocketName;
    cdPushSocketTypeGuid;
    cdPushSocketTypeId;
    docId;
    cdPushSocketEnabled;
    // {
    //     "ngModule": "UserModule",
    //     "resourceName": "SessService",
    //     "resourceGuid": "resourceGuid",
    //     "jwtToken": "",
    //     "socket": "",
    //     "commTrack": {
    //         "initTime": 12345,
    //         "relayTime": null,
    //         "relayed": false,
    //         "deliveryTime": null,
    //         "deliverd": false
    //     }
    // }
    ngModule;
    resourceName;
    resourceGuid;
    jwtToken;
    socket;
    commTrack;
    initTime;
    relayTime;
    relayed;
    deliveryTime;
    deliverd;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_push_socket_id',
    })
], CdPushSocketModel.prototype, "cdPushSocketId", void 0);
__decorate([
    Column({
        name: 'cd_push_socket_guid',
        length: 36,
    })
], CdPushSocketModel.prototype, "cdPushSocketGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_push_socket_name',
        length: 50,
        nullable: true,
    })
], CdPushSocketModel.prototype, "cdPushSocketName", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_push_socket_type_guid',
        length: 40,
        default: null,
    })
], CdPushSocketModel.prototype, "cdPushSocketTypeGuid", void 0);
__decorate([
    Column({
        name: 'cd_push_socket_type_id',
        default: null,
    })
], CdPushSocketModel.prototype, "cdPushSocketTypeId", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CdPushSocketModel.prototype, "docId", void 0);
__decorate([
    Column('tinyint', {
        name: 'cd_push_socket_enabled',
        default: null,
    })
], CdPushSocketModel.prototype, "cdPushSocketEnabled", void 0);
__decorate([
    Column({
        name: 'ng_module',
        length: 60,
        default: null,
    })
], CdPushSocketModel.prototype, "ngModule", void 0);
__decorate([
    Column({
        name: 'resource_name',
        length: 40,
        default: null,
    })
], CdPushSocketModel.prototype, "resourceName", void 0);
__decorate([
    Column({
        name: 'resource_guid',
        length: 60,
        default: null,
    })
], CdPushSocketModel.prototype, "resourceGuid", void 0);
__decorate([
    Column({
        name: 'jwt_token',
        length: 500,
        default: null,
    })
], CdPushSocketModel.prototype, "jwtToken", void 0);
__decorate([
    Column({
        name: 'socket',
        type: 'binary',
    })
], CdPushSocketModel.prototype, "socket", void 0);
__decorate([
    Column({
        name: 'comm_track',
        type: 'json',
    })
], CdPushSocketModel.prototype, "commTrack", void 0);
__decorate([
    Column({
        name: 'init_time',
        default: null,
    })
], CdPushSocketModel.prototype, "initTime", void 0);
__decorate([
    Column({
        name: 'relay_time',
        default: null,
    })
], CdPushSocketModel.prototype, "relayTime", void 0);
__decorate([
    Column({
        name: 'relayed',
        default: null,
    })
], CdPushSocketModel.prototype, "relayed", void 0);
__decorate([
    Column({
        name: 'delivery_time',
        default: null,
    })
], CdPushSocketModel.prototype, "deliveryTime", void 0);
__decorate([
    Column({
        name: 'deliverd',
        default: null,
    })
], CdPushSocketModel.prototype, "deliverd", void 0);
CdPushSocketModel = __decorate([
    Entity({
        name: 'cd_push_socket',
        synchronize: false,
    })
    // @CdModel
], CdPushSocketModel);
export { CdPushSocketModel };
