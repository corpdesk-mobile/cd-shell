// // import { CdCliProfileController } from '../../cd-cli/controllers/cd-cli-profile.cointroller.js';
// import CdCliVaultController from '../../cd-cli/controllers/cd-cli-vault.controller.js';
// import { VAULT_DIRECTORY } from '../../cd-cli/models/cd-cli-vault.model.js';
import CdLog from '../../cd-comm/controllers/cd-logger.controller.js';
import { SessonController } from './session.controller.js';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
export class UserController {
    // svServer = new HttpService();
    ctlSession = new SessonController();
    // ctlCdCliProfile = new CdCliProfileController();
    // private SESSION_FILE_STORE = join(__dirname, SESSION_FILE_STORE);
    init(debugLevel) {
        CdLog.setDebugLevel(debugLevel);
    }
}
