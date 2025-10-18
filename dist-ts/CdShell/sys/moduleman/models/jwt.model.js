var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
let JwtModel = class JwtModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'jwt_id',
    }),
    __metadata("design:type", Number)
], JwtModel.prototype, "jwtId", void 0);
__decorate([
    Column({
        name: 'jwt_guid',
        length: 36,
    }),
    __metadata("design:type", String)
], JwtModel.prototype, "jwtGuid", void 0);
__decorate([
    Column({
        name: 'jwt_type_id',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], JwtModel.prototype, "jwtTypeId", void 0);
__decorate([
    Column('varchar', {
        name: 'jwt_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], JwtModel.prototype, "jwtName", void 0);
__decorate([
    Column('varchar', {
        name: 'jwt_description',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], JwtModel.prototype, "jwtDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], JwtModel.prototype, "docId", void 0);
JwtModel = __decorate([
    Entity({
        name: 'jwt',
        synchronize: false,
    })
    // @CdModel
], JwtModel);
export { JwtModel };
