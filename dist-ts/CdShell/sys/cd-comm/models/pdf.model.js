var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
let PdfModel = class PdfModel {
    pdfId;
    pdfGuid;
    pdfName;
    companyDescription;
    docId;
};
__decorate([
    PrimaryGeneratedColumn({
        name: 'pdf_id',
    })
], PdfModel.prototype, "pdfId", void 0);
__decorate([
    Column({
        name: 'pdf_guid',
    })
], PdfModel.prototype, "pdfGuid", void 0);
__decorate([
    Column({
        name: 'pdf_name',
    })
], PdfModel.prototype, "pdfName", void 0);
__decorate([
    Column({
        name: 'pdf_description',
    })
], PdfModel.prototype, "companyDescription", void 0);
__decorate([
    Column({
        name: 'doc_id',
    })
], PdfModel.prototype, "docId", void 0);
PdfModel = __decorate([
    Entity()
], PdfModel);
export { PdfModel };
