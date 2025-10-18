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
import { validateOrReject } from 'class-validator';
// company_type_id, company_type_name, company_type_description,
// usedIn_asset_registration, directory_categories, company_type_guid, doc_id, parent_id
let CompanyTypeModel = class CompanyTypeModel {
    // HOOKS
    async validate() {
        await validateOrReject(this);
    }
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'company_type_id',
    }),
    __metadata("design:type", Number)
], CompanyTypeModel.prototype, "companyTypeId", void 0);
__decorate([
    Column({
        name: 'company_type_guid',
        length: 36,
    }),
    __metadata("design:type", String)
], CompanyTypeModel.prototype, "companyTypeGuid", void 0);
__decorate([
    Column('varchar', {
        name: 'company_type_name',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CompanyTypeModel.prototype, "companyTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'company_type_description',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], CompanyTypeModel.prototype, "companyTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        length: 60,
        default: null,
    }),
    __metadata("design:type", String)
], CompanyTypeModel.prototype, "docId", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyTypeModel.prototype, "validate", null);
CompanyTypeModel = __decorate([
    Entity({
        name: 'company_type',
        synchronize: false,
    })
    // @CdModel
], CompanyTypeModel);
export { CompanyTypeModel };
