import { io } from "socket.io-client";
// import { CdLog } from "../../sys/logging/cd-log.service.js";

export class IdePushClientService {
  constructor(apiUrl, workspacePath) {
    this.apiUrl = apiUrl;
    this.workspacePath = workspacePath;
    this.socket = null;

    console.info("[IdePushClientService] Initializing...");
    this.connect();
    this.mockWatchSave();
  }

  connect() {
    try {
      console.info(`[IdePushClientService] Connecting to ${this.apiUrl}...`);
      const sioOptions = {
        path: "/socket.io", // <-- fix
        transports: ["polling"],
        secure: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      };
      console.info(`[IdePushClientService] socket.io options: ${JSON.stringify(sioOptions)}...`);
      this.socket = io(this.apiUrl, sioOptions);

      this.socket.on("connect", () => {
        console.info("[IdePushClientService] ✅ Connected to cd-api");
      });

      this.socket.on("disconnect", () => {
        console.warn("[IdePushClientService] ⚠️ Disconnected from cd-api");
      });
    } catch (err) {
      console.error("[IdePushClientService] Connection error:", err.message);
    }
  }

  // 🔹 Mock watcher (browser-friendly)
  mockWatchSave() {
    console.info(
      `[IdePushClientService] Mock watcher active on: ${this.workspacePath}`
    );
  }

  // 🔹 Simulate "save" event trigger
  sendSaveEvent(filePath) {
    console.info(`[IdePushClientService] Sending save event for: ${filePath}`);
    if (this.socket && this.socket.connected) {
      this.socket.emit("ide-push-save", { file: filePath, ts: Date.now() });
    } else {
      console.warn(
        "[IdePushClientService] Cannot send save event — socket not connected."
      );
    }
  }
}
