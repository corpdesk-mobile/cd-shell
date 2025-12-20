import { inspect } from "util";
import { IControllerInfo } from "../models/controller.model";
import { ICdModule } from "../models/module.model";
import { MenuItem } from "../models/menu.model";
import { MenuService } from "./menu.service";
import { diag_css } from "../../utils/diagnosis";

export class ControllerService {
  findControllerInfoByRoute(
    mod: ICdModule,
    route: string
  ): IControllerInfo | undefined {
    // Assuming route format is: ctx/moduleId/controllerName
    const parts = route.split("/");
    const controllerName = parts[parts.length - 1];
    console.log('[ControllerService][findControllerInfoByRoute] controllerName:', controllerName)
    console.log('[ControllerService][findControllerInfoByRoute] mod:', inspect(mod, {depth: 2}))
    return mod.controllers.find((c) => c.name === controllerName);
  }

  /**
   * STEP 7
   * Purpose:
   * Auto-load the default controller view after menu render.
   *
   * CRITICAL:
   * - Must execute AFTER sidebar render
   * - Must execute BEFORE mobile UX wiring
   */
  async loadDefaultController(
    svMenu: MenuService,
    preparedMenu: MenuItem[],
    defaultModule?: ICdModule
  ): Promise<void> {
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );

      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }
  }
}
