// // src/module/services/moduleService.ts


import { renderPlainMenu } from "../../menu/services/menuRenderer";
import { logger } from "../../utils/logger";
import { ICdModule } from "../models/module.model";

// Preload all modules using glob
const modules = import.meta.glob("/src/modules/**/index.js");

export async function loadModule(ctx: string, moduleId: string): Promise<ICdModule> {
  const expectedPathFragment = `/src/modules/${ctx}/${moduleId}/index.js`;
  logger.debug("loadModule()/expectedPathFragment:", expectedPathFragment);

  const pathKey = Object.keys(modules).find((key) =>
    key.includes(expectedPathFragment)
  );

  if (!pathKey) {
    throw new Error(`Module not found for ctx=${ctx}, moduleId=${moduleId}`);
  }

  const loader = modules[pathKey];
  const mod = await loader() as { module: ICdModule };
  logger.debug("loadModule()/mod:", mod);

  const moduleInfo = mod.module;
  if (!moduleInfo) {
    throw new Error(`Missing 'module' export in: ${pathKey}`);
  }

  // Render default template
  document.getElementById("content")!.innerHTML = moduleInfo.template;

  return moduleInfo;
  
}


