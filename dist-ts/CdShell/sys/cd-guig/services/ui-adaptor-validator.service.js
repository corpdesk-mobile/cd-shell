import { LoggerService } from "../../../utils/logger.service";
export class UiAdapterValidatorService {
    constructor() {
        this.logger = new LoggerService();
    }
    assertValid(adapter) {
        if (!adapter) {
            throw new Error("[UiAdapterValidator] Adapter instance is null");
        }
        this.assertMethod(adapter, "getMeta");
        this.assertMethod(adapter, "getCapabilities");
        this.assertMethod(adapter, "activate");
        const meta = adapter.getMeta();
        this.assertMeta(meta);
        this.logger.debug("[UiAdapterValidator]", "Adapter validated successfully", meta);
    }
    assertMethod(obj, name) {
        if (typeof obj[name] !== "function") {
            throw new Error(`[UiAdapterValidator] Missing required method: ${name}()`);
        }
    }
    assertMeta(meta) {
        if (!meta.id || !meta.name || !meta.version) {
            throw new Error("[UiAdapterValidator] Adapter meta is incomplete");
        }
    }
}
