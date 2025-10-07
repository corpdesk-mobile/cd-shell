/**
 *
 * Usage Guide
 * ***********************************************
//  1. Using Preset Profile (cdApiLocal)
const httpService = new HttpService(true); // Enable debugMode
const postData: ICdRequest;
const result = await httpService.proc(
  postData,
  'cdApiLocal', // Optional since it's the default
);

if (result.state) {
  console.log('✅ Modules:', result.data);
} else {
  console.error('❌ Error:', result.message);
}

***************************************************

// 2. Using profile:
const httpService = new HttpService(true); // With debug logs
// Optionally initialize the profile (skipped automatically if `request()` or `proc()` is called)
await httpService.init('deepseek');

const profileName = 'deepseek';

const config: AxiosRequestConfig = {
  method: 'POST',
  url: '/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer #apiKey', // Will be decrypted automatically
  },
  data: {
    model: 'deepseek-chat',
    messages: [
      { role: 'user', content: 'What is the capital of Kenya?' },
    ],
  },
};

// Make the request (profile must exist in your cd-cli profile list)
const response = await httpService.request(config, profileName);

if (response.state) {
  console.log('✅ Response from Deepseek:', response.data);
} else {
  console.error('❌ Error calling Deepseek:', response.message);
}

*************************************************************************
3.

const profileDetails = profile.cdCliProfileData.details;
const result = await httpService.request(profileDetails.httpConfig, 'deepseek');

*******************************************************************************

4. Typical profile with httpConfig

{
  "cdCliProfileName": "deepseek",
  "cdCliProfileData": {
    "details": {
      "apiKey": {
        "name": "apiKey",
        "description": "Encrypted Deepseek API key",
        "value": null,
        "encryptedValue": "<long-encrypted-string>",
        "isEncrypted": true,
        "encryptionMeta": {
          "name": "default",
          "algorithm": "aes-256-cbc",
          "encoding": "hex",
          "ivLength": 16,
          "iv": "<iv-hex>",
          "encryptedAt": "2025-05-25T10:24:35.527Z"
        }
      },
      "baseUrl": "https://api.deepseek.com/v1",
      "defaultModel": "deepseek-chat",
      "cryptFields": ["apiKey"],
      "httpConfig": {
        "method": "POST",
        "url": "/chat/completions",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer #apiKey"
        },
        "data": null
      },
      "encrypted": true
    }
  }
}




 */
import axios from "axios";
// import { IProfileDetails } from "../cd-cli/models/cd-cli-profile.model.js";
// import config from "../../../config.js";
// import CdCliVaultController from "../cd-cli/controllers/cd-cli-vault.controller.js";
import { inspect } from "util";
import config from "../../../config.js";
export class HttpService {
    cfg;
    instances = new Map();
    cdApiAxiosConfig;
    constructor(cfg = config) {
        this.cfg = cfg;
    }
    get env() {
        return this.cfg.env || { app: "cd-shell", debug: false };
    }
    log(...args) {
        if (this.env.debug)
            console.log("[HttpService]", ...args);
    }
    async ensureInstance(profileName, endpoint) {
        const name = profileName || "cdApiLocal";
        if (this.instances.has(name))
            return;
        const baseURL = endpoint ||
            this.cfg.cdApi?.endpoint ||
            this.cfg.profiles?.[name]?.endpoint;
        if (!baseURL)
            throw new Error(`No endpoint found for profile '${name}'.`);
        const instance = axios.create({
            baseURL,
            timeout: this.cfg.cdApi?.timeout || 15000,
            // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: { "Content-Type": "application/json" },
        });
        this.instances.set(name, instance);
        this.cdApiAxiosConfig = { method: "POST", url: baseURL, data: null };
        this.log(`Initialized Axios instance [${name}] → ${baseURL}`);
    }
    async request(config, profileName = "cdApiLocal") {
        const instance = this.instances.get(profileName);
        if (!instance)
            return {
                state: false,
                data: null,
                message: `Instance ${profileName} missing.`,
            };
        try {
            this.log("Request Config:", config);
            const response = await instance.request(config);
            return { state: true, data: response.data, message: "Request succeeded" };
        }
        catch (e) {
            const message = e.response?.data?.app_state?.info?.app_msg ||
                e.message ||
                "Unknown error";
            this.log("Request Error:", message);
            return {
                state: false,
                data: null,
                message: `HTTP Error: ${inspect(message, { depth: 3 })}`,
            };
        }
    }
    async proc(params, profileName) {
        const app = this.env.app;
        const name = profileName || "cdApiLocal";
        const endpoint = app === "cd-cli"
            ? this.cfg.profiles?.[name]?.endpoint
            : this.cfg.cdApi?.endpoint;
        await this.ensureInstance(name, endpoint);
        const cfg = {
            ...(this.cdApiAxiosConfig || {}),
            data: params,
        };
        return this.request(cfg, name);
    }
}
