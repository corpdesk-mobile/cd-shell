var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BeforeInsert, BeforeUpdate, } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from 'uuid';
import { validateOrReject } from 'class-validator';
let CdGeoViewModel = class CdGeoViewModel {
    // HOOKS
    async validate() {
        await validateOrReject(this);
    }
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_type_id',
    }),
    __metadata("design:type", Number)
], CdGeoViewModel.prototype, "cdGeoTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_type_guid',
        length: 36,
        default: uuidv4(),
    }),
    __metadata("design:type", String)
], CdGeoViewModel.prototype, "cdGeoTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_geo_type_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoViewModel.prototype, "cdGeoTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_geo_type_description',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CdGeoViewModel.prototype, "cdGeoTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoViewModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'parent_guid',
        default: null,
    }),
    __metadata("design:type", Number)
], CdGeoViewModel.prototype, "parentGuid", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CdGeoViewModel.prototype, "validate", null);
CdGeoViewModel = __decorate([
    Entity({
        name: 'cd_geo_type',
        synchronize: false,
    })
    // @CdModel
], CdGeoViewModel);
export { CdGeoViewModel };
