import { envCdApi, envCdApiApp, envCdApiSys, envTestBed, envWorkshop, } from './environment.model.js';
import { AppType } from '../index.js';
export const repoRegistry = [
    {
        name: 'cd-ai',
        repository: {
            name: 'cd-ai',
            appType: AppType.CdApiModule,
            url: 'https://github.com/corpdesk/cd-ai.git',
            type: 'git',
            enabled: true,
            isPrivate: false,
            credentials: {
                repoHost: 'corpdesk',
            },
            directories: [
                /**
                 * This is the workshop output directory associated with this particular version controller descriptor.
                 * It is used to scafold the module for the cd-ai.
                 */
                {
                    name: 'workshopModuleOutput',
                    environment: envWorkshop,
                    path: '/home/emp-12/cd-cli/dist/CdCli/app/app-craft/workshop/cd-module/output/cd-ai',
                    purpose: 'Auto-generated source files',
                    isDefault: true,
                },
                /**
                 * This is the test-bed for this scafold module.
                 * The module is first generated in the workshop output directory,
                 * then synced with the git repository.
                 * It is then used for integration and live testing.
                 * The test-bed is used to test the module in a live environment.
                 */
                {
                    name: 'moduleTestBed',
                    environment: envTestBed,
                    path: '/home/emp-12/cd-projects/cd-api/src/CdApi/app/cd-ai',
                    purpose: 'Integration and live testing',
                },
                /**
                 * This is the app directory for the test-bed, cd-api.
                 */
                {
                    name: 'testBedApiApp',
                    environment: envCdApiApp,
                    path: '/home/emp-12/cd-projects/cd-api/src/CdApi/app',
                    purpose: 'cd-api apps directory',
                },
                /**
                 * This is the sys directory for the test-bed, cd-api.
                 */
                {
                    name: 'testBedApiSys',
                    environment: envCdApiSys,
                    path: '/home/emp-12/cd-projects/cd-api/src/CdApi/sys',
                    purpose: 'cd-api system directory',
                },
                /**
                 * This is the root directory for the test-bed, cd-api.
                 * It is used to derive the app descriptor path for the cd-api.
                 */
                {
                    name: 'testBedApiRoot',
                    environment: envCdApi,
                    path: '/home/emp-12/cd-projects/cd-api',
                    purpose: 'cd-api root directory',
                },
                /**
                 * This is the app descriptor for this particular version controller descriptor.
                 * In this case it is the cd-api root directory.
                 * It is used to derive the app descriptor path for the cd-api.
                 */
                {
                    name: 'CdAppDescriptor',
                    environment: envCdApi,
                    path: '/home/emp-12/cd-projects/cd-api/.cd/cd-app.descriptor.json',
                    purpose: 'cd-api root directory',
                },
            ],
        },
    },
    {
        repository: {
            name: 'cd-cli',
            description: 'Node.js CLI for Corpdesk',
            url: 'https://github.com/corpdesk/cd-cli-nodejs/',
            type: 'git',
            enabled: true,
            isPrivate: false,
            credentials: {
                repoHost: 'github.com',
            },
        },
        context: ['cd-cli'],
        versionControlBranch: {
            name: 'main',
            type: 'main',
        },
        // devRoadmap: {
        //   strategy: 'trunk-based',
        //   mergeMethod: 'merge',
        // },
        sourceContributors: [
            {
                name: 'George Oremo',
                email: 'george.oremo@gmail.com',
                role: 'owner',
            },
        ],
    },
    {
        name: 'cd-api',
        repository: {
            name: 'cd-api',
            appType: AppType.CdApi,
            url: 'https://github.com/corpdesk/cd-api.git',
            type: 'git',
            enabled: true,
            isPrivate: false,
            credentials: {
                repoHost: 'corpdesk',
            },
            directories: [
                {
                    environment: envTestBed,
                    path: '/home/emp-12/cd-projects/cd-api',
                    purpose: 'Integration and live testing',
                },
                {
                    environment: envCdApiApp,
                    path: '/home/emp-12/cd-projects/cd-api/src/CdApi/app',
                    purpose: 'cd-api apps directory',
                },
                {
                    environment: envCdApiSys,
                    path: '/home/emp-12/cd-projects/cd-api/src/CdApi/sys',
                    purpose: 'cd-api system directory',
                },
                {
                    environment: envCdApi,
                    path: '/home/emp-12/cd-projects/cd-api',
                    purpose: 'cd-api root directory',
                },
            ],
        },
    },
    {
        repository: {
            name: 'cd-shell',
            description: 'Angular module federation shell for Corpdesk frontend',
            url: 'https://github.com/corpdesk/cd-shell/',
            type: 'git',
            enabled: true,
            isPrivate: false,
            credentials: {
                repoHost: 'github.com',
            },
        },
        context: ['cd-frontend', 'cd-shell'],
        versionControlBranch: {
            name: 'main',
            type: 'main',
        },
    },
    {
        repository: {
            name: 'cd-user',
            description: 'Angular module federation remote module for user',
            url: 'https://github.com/corpdesk/cd-user/',
            type: 'git',
            enabled: true,
            isPrivate: false,
            credentials: {
                repoHost: 'github.com',
            },
        },
        context: ['cd-frontend', 'cd-user'],
        versionControlBranch: {
            name: 'main',
            type: 'main',
        },
    },
];
// Function to get a repository by name
export function getVersionControlByName(name, repositories) {
    return repositories.find((repo) => repo.repository.name === name);
}
// Function to get repositories by context
export function getVersionControlByContext(context, repositories) {
    return repositories.filter((repo) => repo.context?.includes(context) ?? false);
}
