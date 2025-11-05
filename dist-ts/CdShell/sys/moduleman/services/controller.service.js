import { inspect } from "util";
export class ControllerService {
    findControllerInfoByRoute(mod, route) {
        // Assuming route format is: ctx/moduleId/controllerName
        const parts = route.split("/");
        const controllerName = parts[parts.length - 1];
        console.log('[ControllerService][findControllerInfoByRoute] controllerName:', controllerName);
        console.log('[ControllerService][findControllerInfoByRoute] mod:', inspect(mod, { depth: 2 }));
        return mod.controllers.find((c) => c.name === controllerName);
    }
}
