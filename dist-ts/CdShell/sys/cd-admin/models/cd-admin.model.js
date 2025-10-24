// src/CdShell/adm/admin/models/cd-admin.model.ts
export class AdminConfigModel {
    constructor(data) {
        this.activeUiSystemId = 'bootstrap-5';
        this.activeThemePath = '/themes/bootstrap-5/default.json';
        this.logLevel = 'debug';
        Object.assign(this, data);
    }
}
