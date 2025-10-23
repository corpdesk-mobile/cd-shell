export interface IUiSystemIntrospector {
  readonly systemId: string;
  readonly version: string;
  // scanComponents(): Promise<RawUiComponentMeta[]>;
  // scanThemes?(): Promise<RawUiThemeMeta[]>;
  // scanDirectives?(): Promise<RawUiDirectiveMeta[]>;
}
