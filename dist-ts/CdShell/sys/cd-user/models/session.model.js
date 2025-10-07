var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
let SessionModel = class SessionModel {
    sessionId;
    // @IsInt()
    currentUserId;
    cdToken;
    // @IsJSON()
    startTime;
    // @IsInt()
    accTime;
    // @IsInt()
    ttl;
    active;
    // @IsInt()
    deviceNetId;
    // consumer_guid:
    consumerGuid;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'session_id',
    })
], SessionModel.prototype, "sessionId", void 0);
__decorate([
    Column({
        name: 'current_user_id',
        default: 1000,
    })
    // @IsInt()
], SessionModel.prototype, "currentUserId", void 0);
__decorate([
    Column({
        name: 'cd_token',
    })
], SessionModel.prototype, "cdToken", void 0);
__decorate([
    Column({
        name: 'start_time',
        default: null,
    })
    // @IsJSON()
], SessionModel.prototype, "startTime", void 0);
__decorate([
    Column({
        name: 'acc_time',
        default: null,
    })
    // @IsInt()
], SessionModel.prototype, "accTime", void 0);
__decorate([
    Column({
        default: null,
    })
    // @IsInt()
], SessionModel.prototype, "ttl", void 0);
__decorate([
    Column({
        default: null,
    })
], SessionModel.prototype, "active", void 0);
__decorate([
    Column('json', {
        name: 'device_net_id',
        default: null,
    })
    // @IsInt()
], SessionModel.prototype, "deviceNetId", void 0);
__decorate([
    Column({
        name: 'consumer_guid',
        length: 36,
        // default: uuidv4()
    })
], SessionModel.prototype, "consumerGuid", void 0);
SessionModel = __decorate([
    Entity({ name: 'session', synchronize: false })
], SessionModel);
export { SessionModel };
