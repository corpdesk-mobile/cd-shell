import { loadShellConfig } from "../config/shell.config";
import { LoggerService } from "./logger.service"
const shellConfig = await loadShellConfig();
export const logger = new LoggerService({ level: shellConfig.logLevel })