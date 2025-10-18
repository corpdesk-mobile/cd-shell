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
let CalendarModel = class CalendarModel {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], CalendarModel.prototype, "calendarId", void 0);
__decorate([
    Column({
        length: 36,
        default: uuidv4()
    }),
    __metadata("design:type", String)
], CalendarModel.prototype, "calendarGuid", void 0);
__decorate([
    Column('varchar', {
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], CalendarModel.prototype, "calendarName", void 0);
CalendarModel = __decorate([
    Entity()
], CalendarModel);
export { CalendarModel };
