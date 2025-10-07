var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
let CdSchedulerModel = class CdSchedulerModel {
    cdSchedulerId;
    cdSchedulerGuid;
    cdSchedulerName;
    cdSchedulerTypeGuid;
    docId;
    cdSchedulerEnabled;
    cd_scheduler_description;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'cd_scheduler_id',
    })
], CdSchedulerModel.prototype, "cdSchedulerId", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_guid',
    })
], CdSchedulerModel.prototype, "cdSchedulerGuid", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_name',
    })
], CdSchedulerModel.prototype, "cdSchedulerName", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_type_guid',
    })
], CdSchedulerModel.prototype, "cdSchedulerTypeGuid", void 0);
__decorate([
    Column({
        name: 'doc_id',
    })
], CdSchedulerModel.prototype, "docId", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_enabled',
    })
], CdSchedulerModel.prototype, "cdSchedulerEnabled", void 0);
__decorate([
    Column({
        name: 'cd_scheduler_description',
    })
], CdSchedulerModel.prototype, "cd_scheduler_description", void 0);
CdSchedulerModel = __decorate([
    Entity({
        name: 'cdScheduler',
        synchronize: false,
    })
    // @CdModel
], CdSchedulerModel);
export { CdSchedulerModel };
