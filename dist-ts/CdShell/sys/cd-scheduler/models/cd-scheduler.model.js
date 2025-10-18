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
let CdSchedulerModel = class CdSchedulerModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_scheduler_id',
    }),
    __metadata("design:type", Number)
], CdSchedulerModel.prototype, "cdSchedulerId", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_guid',
    }),
    __metadata("design:type", String)
], CdSchedulerModel.prototype, "cdSchedulerGuid", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_name',
    }),
    __metadata("design:type", String)
], CdSchedulerModel.prototype, "cdSchedulerName", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_type_guid',
    }),
    __metadata("design:type", Number)
], CdSchedulerModel.prototype, "cdSchedulerTypeGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
    }),
    __metadata("design:type", Number)
], CdSchedulerModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_enabled',
    }),
    __metadata("design:type", Boolean)
], CdSchedulerModel.prototype, "cdSchedulerEnabled", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_description',
    }),
    __metadata("design:type", String)
], CdSchedulerModel.prototype, "cd_scheduler_description", void 0);
CdSchedulerModel = __decorate([
    Entity({
        name: 'cdScheduler',
        synchronize: false,
    })
    // @CdModel
], CdSchedulerModel);
export { CdSchedulerModel };
