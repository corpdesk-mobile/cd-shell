import * as fs from "node:fs";
import * as path from "node:path";
// import * as process from "node:process";
import { ShellConfig } from "../base/models/IBase";


export async function loadShellConfig(): Promise<ShellConfig> {
  const res = await fetch('/shell.config.json');
  if (!res.ok) {
    throw new Error(`Failed to load shell config: ${res.statusText}`);
  }
  return await res.json();
}
