// import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
// import { Bootstrap502Adapter } from "../services/bootstrap-502-adaptor.service";
// import { MaterialAdapter } from "../services/material-adaptor.service";
// import { PlainAdapter } from "../services/plain-adaptor.service";
// import { Bootstrap538Adapter } from "../services/ui-system-adapters";
import { Bootstrap502AdapterService } from "../../../app/ui-adaptor-port/services/bootstrap-502-adapter.service";
import { Bootstrap538AdapterService } from "../../../app/ui-adaptor-port/services/bootstrap-538-adapter.service";
import { MaterialDesignAdapterService } from "../../../app/ui-adaptor-port/services/material-design-adapter.service";
import { PlainAdapterService } from "../../../app/ui-adaptor-port/services/plain-adapter.service";
export const SYSTEM_ADAPTERS = {
    "bootstrap-502": new Bootstrap502AdapterService(),
    "bootstrap-538": new Bootstrap538AdapterService(),
    "material-design": new MaterialDesignAdapterService(),
    "plain": new PlainAdapterService(),
};
// export interface UiSystemDescriptor {
//   id: UiSystemId;
//   version?: string;
//   theme?: "light" | "dark";
//   manifestUrl?: string;
//   cssLoaded?: boolean;
// }
export const DEFAULT_SYSTEM = {
    id: "bootstrap-538",
    version: "5.3.8",
    themeActive: "light",
};
