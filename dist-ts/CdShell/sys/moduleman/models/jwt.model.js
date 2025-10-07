var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
let JwtModel = class JwtModel {
    jwtId;
    jwtGuid;
    jwtTypeId;
    jwtName;
    jwtDescription;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'jwt_id',
    })
], JwtModel.prototype, "jwtId", void 0);
__decorate([
    Column({
        name: 'jwt_guid',
        length: 36,
    })
], JwtModel.prototype, "jwtGuid", void 0);
__decorate([
    Column({
        name: 'jwt_type_id',
        length: 60,
        default: null,
    })
], JwtModel.prototype, "jwtTypeId", void 0);
__decorate([
    Column('varchar', {
        name: 'jwt_name',
        length: 50,
        nullable: true,
    })
], JwtModel.prototype, "jwtName", void 0);
__decorate([
    Column('varchar', {
        name: 'jwt_description',
        length: 50,
        nullable: true,
    })
], JwtModel.prototype, "jwtDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        length: 60,
        default: null,
    })
], JwtModel.prototype, "docId", void 0);
JwtModel = __decorate([
    Entity({
        name: 'jwt',
        synchronize: false,
    })
    // @CdModel
], JwtModel);
export { JwtModel };
