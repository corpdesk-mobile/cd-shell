import { dirname, resolve } from 'path';
import { CdObjModel } from '../../moduleman/models/cd-obj.model.js';
import { fileURLToPath } from 'url';
// import { HOME } from '../../utils/fs.util.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const DEV_DESCRIPTORS_SERVICE_DIR = resolve(
// process.cwd(),
// HOME,
'cd-cli', "dist/CdCli/sys/dev-descriptor/services");
/**
 * Utility function to convert CdDescriptor into CdObjModel
 */
export function mapDescriptorToCdObj(descriptor) {
    console.log('DevDescriptorModel::mapDescriptorToCdObj()/starting...');
    const cdObj = new CdObjModel();
    cdObj.cdObjId = descriptor.cdObjId;
    cdObj.cdObjName = descriptor.cdObjName;
    cdObj.cdObjGuid = descriptor.cdObjGuid;
    cdObj.jDetails = descriptor.jDetails
        ? JSON.stringify(descriptor.jDetails)
        : null;
    return cdObj;
}
