import * as fs from "node:fs";
import * as path from "node:path";
// import * as process from "node:process";
import { ShellConfig } from "../base/models/IBase";

// export async function loadShellConfig(): Promise<ShellConfig> {
//   // return contents of shell.config.json
//   return fs.promises
//     .readFile(path.join(__dirname, "shell.config.json"), "utf-8")
//     .then((data) => {
//       return JSON.parse(data);
//     });
// }

// export async function loadShellConfig(): Promise<ShellConfig> {
//   const configPath = path.resolve(process.cwd(), 'shell.config.json');
//   try {
//     const rawData = await fs.promises.readFile(configPath, 'utf-8');
//     const config = JSON.parse(rawData);

//     // Optional: validate required fields
//     if (!config.appName || !config.themeConfig || !config.defaultModule) {
//       throw new Error('Missing required fields in shell.config.json');
//     }

//     return config as ShellConfig;
//   } catch (err) {
//     throw new Error(`Failed to load shell.config.json: ${(err as Error).message}`);
//   }
// }

export async function loadShellConfig(): Promise<ShellConfig> {
  const res = await fetch('/shell.config.json');
  if (!res.ok) {
    throw new Error(`Failed to load shell config: ${res.statusText}`);
  }
  return await res.json();
}
