import { defaultWorkstation, workstations, } from './workstations.model.js';
export var CdEnvName;
(function (CdEnvName) {
    CdEnvName["WORKSHOP"] = "workshop";
    CdEnvName["TEST_BED"] = "test-bed";
    CdEnvName["PRODUCTION"] = "production";
    CdEnvName["CI_CD"] = "ci-cd";
    CdEnvName["SANDBOX"] = "sandbox";
    CdEnvName["CUSTOM"] = "custom";
    CdEnvName["LOCAL_CD_API_APP"] = "local-cd-api-app";
    CdEnvName["LOCAL_CD_API_SYS"] = "local-cd-api-sys";
    CdEnvName["LOCAL_CD_API"] = "local-cd-api";
    CdEnvName["LOCAL_CD_CLI"] = "local-cd-cli";
    CdEnvName["LOCAL_FRONTEND"] = "local-frontend";
    CdEnvName["LOCAL_PWA"] = "local-pwa";
})(CdEnvName || (CdEnvName = {}));
// ─── Environments ──────────────────────────────────────────────────────────────
export const envWorkshop = {
    name: CdEnvName.WORKSHOP,
    type: 'dev',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
export const envTestBed = {
    name: CdEnvName.TEST_BED,
    type: 'testing',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
export const envCdApiApp = {
    name: CdEnvName.LOCAL_CD_API_APP,
    type: 'local-cd-api-app',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
export const envCdApiSys = {
    name: CdEnvName.LOCAL_CD_API_SYS,
    type: 'local-cd-api-sys',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
export const envCdApi = {
    name: CdEnvName.LOCAL_CD_API,
    type: 'local-cd-api',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
export const envProduction = {
    name: CdEnvName.PRODUCTION,
    type: 'deployment',
    workstation: workstations.find((w) => w.name === 'emp-07') || defaultWorkstation,
};
export const envCdCli = {
    name: CdEnvName.LOCAL_CD_CLI,
    type: 'local-cd-cli',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
export const envFrontend = {
    name: CdEnvName.LOCAL_FRONTEND,
    type: 'local-cd-cli',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
export const envPwa = {
    name: CdEnvName.LOCAL_PWA,
    type: 'local-cd-cli',
    workstation: workstations.find((w) => w.name === 'emp-12') || defaultWorkstation,
};
const vcRepositories = [];
// export const environments: EnvironmentDescriptor[] = [
//   {
//     /**
//      * create an incus container for development
//      */
//     workstation: getWorkstationByName('emp-12', workstations) || defaultWorkstation,
//     services: getServiceByName(['AuthService', 'DatabaseService'], services),
//     environmentVariables: {
//       global: { NODE_ENV: 'development', DEBUG: 'true' },
//       perEnvironment: {
//         local: { API_URL: 'http://localhost:3000' },
//         staging: { API_URL: 'https://staging.api.com' },
//         production: { API_URL: 'https://api.com' },
//       },
//     },
//     ciCd: [getCiCdByName(['Corpdesk CI/CD - Bash Deployment'], knownCiCds)],
//     testingFrameworks: getTestingFramework(['Jest'], testingFrameworks),
//     versionControl: getVersionControlByContext('cd-api', vcRepositories),
//   },
//   {
//     workstation: getWorkstationByName('DevMachine-1', workstations) || defaultWorkstation,
//     services: getServiceByName(['AuthService', 'DatabaseService'], services),
//     environmentVariables: {
//       global: { NODE_ENV: 'development', DEBUG: 'true' },
//       perEnvironment: {
//         local: { API_URL: 'http://localhost:3000' },
//         staging: { API_URL: 'https://staging.api.com' },
//         production: { API_URL: 'https://api.com' },
//       },
//     },
//     ciCd: [getCiCdByName(['Corpdesk CI/CD - Bash Deployment'], knownCiCds)],
//     testingFrameworks: getTestingFramework(['Jest', 'Mocha'], testingFrameworks),
//     versionControl: getVersionControlByContext('cd-api', vcRepositories),
//   },
//   {
//     workstation: getWorkstationByName('DevMachine-2', workstations) || defaultWorkstation,
//     services: getServiceByName(['PaymentService', 'NotificationService'], services),
//     environmentVariables: {
//       global: { LOG_LEVEL: 'verbose' },
//       perEnvironment: {
//         local: { PAYMENT_GATEWAY: 'sandbox' },
//         production: { PAYMENT_GATEWAY: 'live' },
//       },
//     },
//     ciCd: [getCiCdByName(['Corpdesk CI/CD - Bash Deployment'], knownCiCds)],
//     testingFrameworks: getTestingFramework(['Cypress', 'Jasmine'], testingFrameworks),
//     versionControl: getVersionControlByContext('cd-api', vcRepositories),
//   },
//   {
//     workstation: getWorkstationByName('DevMachine-3', workstations) || defaultWorkstation,
//     services: getServiceByName(['CacheService', 'AnalyticsService'], services),
//     environmentVariables: {
//       global: { CACHE_ENABLED: 'true' },
//       perEnvironment: {
//         local: { CACHE_PROVIDER: 'redis' },
//         staging: { CACHE_PROVIDER: 'memcached' },
//       },
//     },
//     ciCd: [getCiCdByName(['Corpdesk CI/CD - Bash Deployment'], knownCiCds)],
//     testingFrameworks: getTestingFramework(['Karma', 'AVA'], testingFrameworks),
//     versionControl: getVersionControlByContext('cd-api', vcRepositories),
//   },
//   {
//     workstation: getWorkstationByName('DevMachine-4', workstations) || defaultWorkstation,
//     services: getServiceByName(['UserService', 'LoggingService'], services),
//     environmentVariables: {
//       global: { ENABLE_LOGGING: 'true' },
//       perEnvironment: {
//         local: { LOG_FORMAT: 'pretty' },
//         production: { LOG_FORMAT: 'json' },
//       },
//     },
//     ciCd: [getCiCdByName(['Corpdesk CI/CD - Bash Deployment'], knownCiCds)],
//     testingFrameworks: getTestingFramework(['Playwright', 'TestCafe'], testingFrameworks),
//     versionControl: getVersionControlByContext('cd-api', vcRepositories),
//   },
// ];
export const defaultEnvironment = {
    workstation: {
        name: 'unknown',
        workstationAccess: {
            accessScope: 'local',
            physicalAccess: 'direct',
            transport: {
                protocol: 'unknown',
                credentials: {
                    sshCredentials: {
                        username: 'unknown',
                        host: '127.0.0.1',
                        port: -1,
                    },
                },
            },
            interactionType: 'cli',
        },
        machineType: {
            name: 'unknown',
            hostMachine: {
                containerId: 'unknown',
                image: 'unknown',
                allocatedResources: {
                    cpuCores: 0,
                    memory: { units: 'GB', value: 0 },
                    storage: { units: 'GB', value: 0 },
                },
            },
        },
        os: {
            name: 'Unknown',
            version: '0.0',
            architecture: 'unknown',
            timezone: 'unknown',
        },
        enabled: true,
        requiredSoftware: [
            {
                name: 'unknown',
                category: 'unknown',
                type: 'unknown',
                source: 'unknown',
                scope: 'unknown',
            },
        ],
    },
};
export function getDevEnvironmentByName(name, environments) {
    return (environments.find((env) => env.workstation.name?.toLowerCase() === name.toLowerCase()) ||
        defaultEnvironment);
}
