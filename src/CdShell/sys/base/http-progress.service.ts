import { HttpFxEvent, HttpFxEventType } from ".";
import { FxEventEmitter } from "./fx-event-emitter";

export class ProgressService {
    fx = new FxEventEmitter();
  private uploadBar = document.getElementById("uploadProgressBar");
  private downloadBar = document.getElementById("downloadProgressBar");

  constructor() {
    this.fx.on((event: HttpFxEvent) => this.handle(event));
  }

  handle(event: HttpFxEvent) {
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

  resetBars() { /* fade out progress bars */ }
  showErrorIndicator() { /* red glow, etc. */ }
}