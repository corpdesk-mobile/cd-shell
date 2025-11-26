import config from "../../../../config";
export class AdminConfigModel {
    constructor(data) {
        this.activeUiSystemId = config.defaultUiConfig?.defaultUiSystemId || 'bootstrap-538';
        this.activeThemePath = '/themes/bootstrap-502/default.json';
        this.logLevel = 'debug';
        Object.assign(this, data);
    }
}
