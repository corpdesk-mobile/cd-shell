var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
let Comm = class Comm {
    commId;
    commGuid;
    commName;
};
__decorate([
    PrimaryGeneratedColumn()
], Comm.prototype, "commId", void 0);
__decorate([
    Column({
        length: 36,
    })
], Comm.prototype, "commGuid", void 0);
__decorate([
    Column('varchar', {
        length: 50,
        nullable: true,
    })
], Comm.prototype, "commName", void 0);
Comm = __decorate([
    Entity()
], Comm);
export { Comm };
