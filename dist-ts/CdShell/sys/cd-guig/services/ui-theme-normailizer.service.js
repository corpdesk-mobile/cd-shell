import { LoggerService } from "../../../utils/logger.service";
export class UiThemeNormalizer {
    static { this.logger = new LoggerService("UiThemeNormalizer"); }
    static normalize(raw, options) {
        if (!raw || typeof raw !== "object") {
            throw new Error("[UiThemeNormalizer] Invalid theme input");
        }
        const source = options?.source ?? "legacy";
        // ---- Merge legacy + new CSS definitions ----
        const cssPaths = new Set();
        if (Array.isArray(raw.stylesheets)) {
            raw.stylesheets.forEach((p) => cssPaths.add(p));
        }
        if (raw.css?.paths) {
            raw.css.paths.forEach((p) => cssPaths.add(p));
        }
        const descriptor = {
            ...raw,
            // ---- Normalize mode ----
            mode: raw.mode ?? "auto",
            // ---- Unified CSS descriptor ----
            css: cssPaths.size || raw.css?.inline
                ? {
                    paths: cssPaths.size ? Array.from(cssPaths) : undefined,
                    inline: raw.css?.inline,
                }
                : undefined,
            // ---- Runtime metadata ----
            meta: {
                source,
                uiSystem: options?.uiSystemId,
                version: raw.meta?.version,
                normalizedAt: Date.now(),
            },
        };
        this.logger.debug("Theme normalized", {
            id: descriptor.id,
            source,
            uiSystem: options?.uiSystemId,
        });
        return descriptor;
    }
}
