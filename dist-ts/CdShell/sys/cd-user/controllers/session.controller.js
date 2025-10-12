/* eslint-disable style/brace-style */
// import { CONFIG_FILE_PATH } from '../../../../config.js';
// import CdCliVaultController from '../../cd-cli/controllers/cd-cli-vault.controller.js';
import CdLog from '../../cd-comm/controllers/cd-logger.controller';
// // import { CdCliProfileController } from '../../cd-cli/controllers/cd-cli-profile.cointroller.js';
export class SessonController {
    init(debugLevel) {
        CdLog.setDebugLevel(debugLevel);
    }
}
