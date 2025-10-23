import { UiSystemSchema } from "../models/ui-system-schema.model";

export class UiThemeLoaderService {
  static loadActiveTheme(system: UiSystemSchema) {
    const head = document.head;
    system.themes.forEach(theme => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      // link.href = `${system.assetPath}/${theme.file}`;
      head.appendChild(link);
    });
  }
}
