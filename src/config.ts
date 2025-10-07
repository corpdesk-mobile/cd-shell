import type { ISessResp } from './CdShell/sys/base/i-base.js';
// import * as dotenv from "dotenv";
import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
/* eslint-disable node/prefer-global/process */
import { DataSource, DataSourceOptions } from 'typeorm';
// import { HOME } from './CdShell/sys/utils/fs.util.js';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export const CONFIG_FILE_PATH = join(process.env.HOME || '~/', '.cd-cli/cd-cli.profiles.json');

export const DEFAULT_SESS: ISessResp = {
  jwt: null,
  ttl: 300,
};


// config.cdApiLocal
export default {
  env: {
    app: 'cd-shell',        // or 'cd-cli', or 'cd-api'
    debug: true,
  },
  // ds: {
  //   sqlite: new DataSource(sqliteConfig),
  //   mysql: new DataSource(mysqlConfig),
  // },
  // db: mysqlConfig,
  // db2: mysqlConfig2,
  // sqliteConfigFx: sqliteConfigFx,
  cdApiLocal: 'cd-api-local',
  cdGitConfig: 'cd-git-config',
  profiles: {
    // used only by cd-cli
    cdApiLocal: {
      endpoint: 'https://localhost:3001/api',
    },
  },
  cdSession: DEFAULT_SESS,
  meta: {
    name: 'cd-cli',
    version: '1.0.0',
    description: 'Your description here',
    showHelpAfterError: true,
  },
  preferences: {
    encryption: {
      encryptionKey: process.env.CD_CLI_ENCRYPT_KEY,
    },
    backUp: [
      {
        profileName: 'cd-git-config',
        field: 'details.gitAccess.gitHubToken',
        useLocal: { state: false, storePath: '~/.cd-cli/' },
        useWeb3: { state: false }, // yet to be defined
        useCloud: { state: false }, // yet to be defined
      },
    ],
  },
  back4app: {
    url: process.env.B4A_URL,
    appId: process.env.X_Parse_Application_Id,
    apiKey: process.env.X_Parse_REST_API_Key,
  },
  ////////////////////////////////////////
  usePush: true,
  usePolling: true,
  useCacheStore: true,
  cacheTtl: process.env.CACHE_TTL,
  emailUsers: [
    {
      name: 'ASDAP',
      email: process.env.EMAIL_ADDRESS,
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
  ],
  cdApi: {
    endpoint: 'https://localhost:3001/api',
    serverHost: 'localhost',
    serverPort: '3001',
    entryPoint: '/api',
    timeout: 15000,
  },
  push: {
    mode: process.env.PUSH_MODE,
    serverHost: 'https://146.190.165.51',
    serverPort: process.env.SIO_PORT,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    /**
     * for redis-adapter cluster
     */
    startupNodes: [
      {
        port: 6380,
        host: process.env.REDIS_HOST,
      },
      {
        port: 6381,
        host: '146.190.157.42',
      },
    ],
    /**
     * for redis-adapter sentinel
     */
    sentinalOptions: {
      sentinels: [
        { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
        { host: 'asdap.net', port: Number(process.env.REDIS_PORT) },
      ],
      name: 'master01',
    },
  },
  modules: {
    sys: {
      // optional if needed later
    },
  },
};

export let AllowModelSyncing = false;

export function enableModelSyncing() {
  AllowModelSyncing = true;
}

export function disableModelSyncing() {
  AllowModelSyncing = false;
}

export function mailConfig(username: string, password: string) {
  return {
    mailService: 'cloudmailin',
    host: 'zohomail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: username,
      pass: password,
    },
    logger: true,
  };
}
