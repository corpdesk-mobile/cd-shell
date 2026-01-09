/**
 * Initialization options for the LoggerService.
 * new LoggerService(); // legacy default
new LoggerService({ context: "Shell", level: "debug" }); // existing
new LoggerService("UiThemeNormalizer"); // new ergonomic form
new LoggerService("UiThemeNormalizer", { level: "warn" }); // optional extension

 */
export class LoggerService {
    // constructor(options: LoggerOptions = {}) {
    //   this.context = options.context || "Shell";
    //   this.level = options.level || "debug";
    //   this.silent = options.silent || false;
    // }
    constructor(contextOrOptions = {}, options) {
        let resolvedOptions;
        // --- NEW ergonomic constructor support ---
        if (typeof contextOrOptions === "string") {
            resolvedOptions = {
                context: contextOrOptions,
                ...options,
            };
        }
        else {
            resolvedOptions = contextOrOptions;
        }
        // --- Existing defaults preserved ---
        this.context = resolvedOptions.context || "Shell";
        this.level = resolvedOptions.level || "debug";
        this.silent = resolvedOptions.silent || false;
    }
    shouldLog(level) {
        const levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        return levels[level] >= levels[this.level];
    }
    log(level, message, ...args) {
        if (this.silent || !this.shouldLog(level))
            return;
        const prefix = `[${this.context.toUpperCase()}] [${level.toUpperCase()}]`;
        switch (level) {
            case "debug":
                console.debug(prefix, message, ...args);
                break;
            case "info":
                console.info(prefix, message, ...args);
                break;
            case "warn":
                console.warn(prefix, message, ...args);
                break;
            case "error":
                console.error(prefix, message, ...args);
                break;
        }
    }
    debug(message, ...args) {
        this.log("debug", message, ...args);
    }
    info(message, ...args) {
        this.log("info", message, ...args);
    }
    warn(message, ...args) {
        this.log("warn", message, ...args);
    }
    error(message, ...args) {
        this.log("error", message, ...args);
    }
    setContext(context) {
        this.context = context;
    }
    setLevel(level) {
        this.level = level;
    }
    silence() {
        this.silent = true;
    }
    unsilence() {
        this.silent = false;
    }
}
