import { HttpFxEventType } from ".";
import { FxEventEmitter } from "./fx-event-emitter";
export class ProgressService {
    fx = new FxEventEmitter();
    uploadBar = document.getElementById("uploadProgressBar");
    downloadBar = document.getElementById("downloadProgressBar");
    constructor() {
        this.fx.on((event) => this.handle(event));
    }
    handle(event) {
        switch (event.type) {
            case HttpFxEventType.UploadProgress:
                this.uploadBar.style.width = `${event.progress}%`;
                break;
            case HttpFxEventType.DownloadProgress:
                this.downloadBar.style.width = `${event.progress}%`;
                break;
            case HttpFxEventType.Success:
                this.resetBars();
                break;
            case HttpFxEventType.Error:
                this.showErrorIndicator();
                break;
        }
    }
    resetBars() { }
    showErrorIndicator() { }
}
