var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { validateOrReject } from 'class-validator';
let CdGeoViewModel = class CdGeoViewModel {
    cdGeoTypeId;
    cdGeoTypeGuid;
    cdGeoTypeName;
    cdGeoTypeDescription;
    docId;
    parentGuid;
    // HOOKS
    async validate() {
        await validateOrReject(this);
    }
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_type_id',
    })
], CdGeoViewModel.prototype, "cdGeoTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_type_guid',
        length: 36,
        default: uuidv4(),
    })
], CdGeoViewModel.prototype, "cdGeoTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_geo_type_name',
        length: 50,
        nullable: true,
    })
], CdGeoViewModel.prototype, "cdGeoTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'cd_geo_type_description',
        length: 50,
        nullable: true,
    })
], CdGeoViewModel.prototype, "cdGeoTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CdGeoViewModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'parent_guid',
        default: null,
    })
], CdGeoViewModel.prototype, "parentGuid", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate()
], CdGeoViewModel.prototype, "validate", null);
CdGeoViewModel = __decorate([
    Entity({
        name: 'cd_geo_type',
        synchronize: false,
    })
    // @CdModel
], CdGeoViewModel);
export { CdGeoViewModel };
