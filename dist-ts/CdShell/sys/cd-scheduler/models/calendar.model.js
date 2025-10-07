var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
let CalendarModel = class CalendarModel {
    calendarId;
    calendarGuid;
    calendarName;
};
__decorate([
    PrimaryGeneratedColumn()
], CalendarModel.prototype, "calendarId", void 0);
__decorate([
    Column({
        length: 36,
        default: uuidv4()
    })
], CalendarModel.prototype, "calendarGuid", void 0);
__decorate([
    Column('varchar', {
        length: 50,
        nullable: true
    })
], CalendarModel.prototype, "calendarName", void 0);
CalendarModel = __decorate([
    Entity()
], CalendarModel);
export { CalendarModel };
