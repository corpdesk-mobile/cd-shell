var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryGeneratedColumn } from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from 'uuid';
let CoopStatPublicFilterModel = class CoopStatPublicFilterModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'coop_stat_public_filter_id'
    }),
    __metadata("design:type", Number)
], CoopStatPublicFilterModel.prototype, "coopStatPublicFilterId", void 0);
__decorate([
    Column({
        name: 'coop_stat_public_filter_guid',
        type: 'char',
        length: 36,
        nullable: false,
        default: () => uuidv4(),
    }),
    __metadata("design:type", String)
], CoopStatPublicFilterModel.prototype, "coopStatPublicFilterGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_stat_public_filter_name',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], CoopStatPublicFilterModel.prototype, "coopStatPublicFilterName", void 0);
__decorate([
    Column('varchar', {
        name: 'coop_stat_public_filter_description',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], CoopStatPublicFilterModel.prototype, "coopStatPublicFilterDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null
    }),
    __metadata("design:type", Number)
], CoopStatPublicFilterModel.prototype, "docId", void 0);
__decorate([
    Column({
        type: 'json',
        name: 'coop_stat_public_filter_specs',
        nullable: true
    }),
    __metadata("design:type", Object)
], CoopStatPublicFilterModel.prototype, "coopStatPublicFilterSpecs", void 0);
__decorate([
    Column({
        name: 'coop_stat_public_filter_enabled',
        nullable: true
    }),
    __metadata("design:type", Boolean)
], CoopStatPublicFilterModel.prototype, "coopStatPublicFilterEnabled", void 0);
CoopStatPublicFilterModel = __decorate([
    Entity({
        name: 'coop_stat_public_filter',
        synchronize: false
    })
    // @CdModel
], CoopStatPublicFilterModel);
export { CoopStatPublicFilterModel };
