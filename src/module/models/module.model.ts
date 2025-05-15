import { MenuItem } from "../../menu/models/menu.model";

export interface ICdModule {
  ctx: string;
  moduleId: string;
  moduleName: string;
  moduleGuid?: string;
  template?: any;
  menu?: MenuItem[];
  moduleVersion?: string;
  modulePath?: string;
  moduleUrl?: string;
  moduleType?: string;
  moduleConfig?: string;
}