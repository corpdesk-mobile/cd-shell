var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';
// group_type_id, group_type_name, group_type_guid, doc_id
let GroupTypeModel = class GroupTypeModel {
    groupTypeId;
    groupTypeName;
    groupTypeGuid;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'group_type_id',
    })
], GroupTypeModel.prototype, "groupTypeId", void 0);
__decorate([
    Column({
        name: 'group_type_name',
        length: 20,
    })
], GroupTypeModel.prototype, "groupTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'group_type_guid',
        length: 40,
        nullable: true,
    })
], GroupTypeModel.prototype, "groupTypeGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    })
], GroupTypeModel.prototype, "docId", void 0);
GroupTypeModel = __decorate([
    Entity({
        name: 'group_type',
        synchronize: false,
    })
    // @CdModel
], GroupTypeModel);
export { GroupTypeModel };
