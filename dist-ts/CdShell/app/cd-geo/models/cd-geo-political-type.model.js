var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let CdGeoPoliticalTypeModel = class CdGeoPoliticalTypeModel {
    cdGeoPoliticalTypeId;
    cdGeoPoliticalTypeGuid;
    cdGeoPoliticalTypeName;
    cdGeoPoliticalTypeDescription;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_geo_political_type_id',
    })
], CdGeoPoliticalTypeModel.prototype, "cdGeoPoliticalTypeId", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_guid',
        length: 36,
        default: uuidv4(),
    })
], CdGeoPoliticalTypeModel.prototype, "cdGeoPoliticalTypeGuid", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_name',
        length: 50,
        nullable: true,
    })
], CdGeoPoliticalTypeModel.prototype, "cdGeoPoliticalTypeName", void 0);
__decorate([
    Column({
        name: 'cd_geo_political_type_description',
        length: 60,
        default: null,
    })
], CdGeoPoliticalTypeModel.prototype, "cdGeoPoliticalTypeDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], CdGeoPoliticalTypeModel.prototype, "docId", void 0);
CdGeoPoliticalTypeModel = __decorate([
    Entity({
        name: 'cd_geo_political_type',
        synchronize: false,
    })
], CdGeoPoliticalTypeModel);
export { CdGeoPoliticalTypeModel };
