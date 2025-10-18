var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryGeneratedColumn } from '../../utils/orm-shim.js';
let SessionModel = class SessionModel {
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'session_id',
    }),
    __metadata("design:type", Number)
], SessionModel.prototype, "sessionId", void 0);
__decorate([
    Column({
        name: 'current_user_id',
        default: 1000,
    })
    // @IsInt()
    ,
    __metadata("design:type", Number)
], SessionModel.prototype, "currentUserId", void 0);
__decorate([
    Column({
        name: 'cd_token',
    }),
    __metadata("design:type", String)
], SessionModel.prototype, "cdToken", void 0);
__decorate([
    Column({
        name: 'start_time',
        default: null,
    })
    // @IsJSON()
    ,
    __metadata("design:type", String)
], SessionModel.prototype, "startTime", void 0);
__decorate([
    Column({
        name: 'acc_time',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", String)
], SessionModel.prototype, "accTime", void 0);
__decorate([
    Column({
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", Number)
], SessionModel.prototype, "ttl", void 0);
__decorate([
    Column({
        default: null,
    }),
    __metadata("design:type", Boolean)
], SessionModel.prototype, "active", void 0);
__decorate([
    Column('json', {
        name: 'device_net_id',
        default: null,
    })
    // @IsInt()
    ,
    __metadata("design:type", Object)
], SessionModel.prototype, "deviceNetId", void 0);
__decorate([
    Column({
        name: 'consumer_guid',
        length: 36,
        // default: uuidv4()
    }),
    __metadata("design:type", String)
], SessionModel.prototype, "consumerGuid", void 0);
SessionModel = __decorate([
    Entity({ name: 'session', synchronize: false })
], SessionModel);
export { SessionModel };
