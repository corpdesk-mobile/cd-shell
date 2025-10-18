export class LoggerService {
    constructor(options = {}) {
        this.context = options.context || 'Shell';
        this.level = options.level || 'debug';
        this.silent = options.silent || false;
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
            case 'debug':
                console.debug(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
        }
    }
    debug(message, ...args) {
        this.log('debug', message, ...args);
    }
    info(message, ...args) {
        this.log('info', message, ...args);
    }
    warn(message, ...args) {
        this.log('warn', message, ...args);
    }
    error(message, ...args) {
        this.log('error', message, ...args);
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
