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
// group_type_id, group_type_name, group_type_guid, doc_id
let GroupTypeModel = class GroupTypeModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'group_type_id',
    }),
    __metadata("design:type", Number)
], GroupTypeModel.prototype, "groupTypeId", void 0);
__decorate([
    Column({
        name: 'group_type_name',
        length: 20,
    }),
    __metadata("design:type", String)
], GroupTypeModel.prototype, "groupTypeName", void 0);
__decorate([
    Column('varchar', {
        name: 'group_type_guid',
        length: 40,
        nullable: true,
    }),
    __metadata("design:type", String)
], GroupTypeModel.prototype, "groupTypeGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
        default: null,
    }),
    __metadata("design:type", Number)
], GroupTypeModel.prototype, "docId", void 0);
GroupTypeModel = __decorate([
    Entity({
        name: 'group_type',
        synchronize: false,
    })
    // @CdModel
], GroupTypeModel);
export { GroupTypeModel };
