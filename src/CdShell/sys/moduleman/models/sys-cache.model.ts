import { IUserProfile, IUserShellConfig } from "../../cd-user/models/user.model";
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { IConsumerProfile } from "./consumer.model";


// export type CacheKey =
//   | "shellConfig"
//   | "uiConfig"
//   | "themeConfig"
//   | "consumerProfile"
//   | "userProfile";

export type CacheListener<T> = (value: T, meta: CacheMeta) => void;

export interface CacheMeta {
  source: "static" | "consumer" | "user" | "runtime" | "resolved";
  version: number;
  timestamp: number;
}

// export interface CacheEntry<T = any> {
//   value: T;
//   meta: CacheMeta;
// }

// export type CacheKey = keyof SysCacheMap;
// // export type CacheKey =
// //   | "shellConfig"
// //   | "uiConfig"
// //   | "themeConfig"
// //   | "consumerProfile"
// //   | "userProfile";

// export type CacheListener<T> = (value: T, meta: CacheMeta) => void;

// export interface CacheMeta {
//   source: "static" | "consumer" | "user" | "runtime";
//   version: number;
//   timestamp: number;
// }

export interface SysCacheMap {
  shellConfig: IUserShellConfig;
  uiConfig: any;
  themeConfig: any;

  uiSystems: UiSystemDescriptor[];
  uiSystemDescriptors: UiSystemDescriptor[];

  consumerProfile: IConsumerProfile | null;
  userProfile: IUserProfile | null;
}