var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// SELECT cd_push_socket_id, cd_push_socket_guid, cd_push_socket_name, cd_push_socket_description, doc_id, cd_push_socket_type_id, `data`
// FROM cd1213.cd_push_socket;
let CdPushSocketModel = class CdPushSocketModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_push_socket_id',
    }),
    __metadata("design:type", Number)
], CdPushSocketModel.prototype, "cdPushSocketId", void 0);
__decorate([
    Column({
        name: 'cd_push_socket_guid',
        length: 36,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "cdPushSocketGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_push_socket_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "cdPushSocketName", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_push_socket_type_guid',
        length: 40,
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "cdPushSocketTypeGuid", void 0);
__decorate([
    Column({
        name: 'cd_push_socket_type_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdPushSocketModel.prototype, "cdPushSocketTypeId", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdPushSocketModel.prototype, "docId", void 0);
__decorate([
    Column('tinyint', {
        name: 'cd_push_socket_enabled',
        default: null,
    }),
    __metadata("design:type", Boolean)
], CdPushSocketModel.prototype, "cdPushSocketEnabled", void 0);
__decorate([
    Column({
        name: 'ng_module',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "ngModule", void 0);
__decorate([
    Column({
        name: 'resource_name',
        length: 40,
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "resourceName", void 0);
__decorate([
    Column({
        name: 'resource_guid',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "resourceGuid", void 0);
__decorate([
    Column({
        name: 'jwt_token',
        length: 500,
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "jwtToken", void 0);
__decorate([
    Column({
        name: 'socket',
        type: 'binary',
    }),
    __metadata("design:type", Object)
], CdPushSocketModel.prototype, "socket", void 0);
__decorate([
    Column({
        name: 'comm_track',
        type: 'json',
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "commTrack", void 0);
__decorate([
    Column({
        name: 'init_time',
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "initTime", void 0);
__decorate([
    Column({
        name: 'relay_time',
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "relayTime", void 0);
__decorate([
    Column({
        name: 'relayed',
        default: null,
    }),
    __metadata("design:type", Boolean)
], CdPushSocketModel.prototype, "relayed", void 0);
__decorate([
    Column({
        name: 'delivery_time',
        default: null,
    }),
    __metadata("design:type", String)
], CdPushSocketModel.prototype, "deliveryTime", void 0);
__decorate([
    Column({
        name: 'deliverd',
        default: null,
    }),
    __metadata("design:type", Boolean)
], CdPushSocketModel.prototype, "deliverd", void 0);
CdPushSocketModel = __decorate([
    Entity({
        name: 'cd_push_socket',
        synchronize: false,
    })
    // @CdModel
], CdPushSocketModel);
export { CdPushSocketModel };
