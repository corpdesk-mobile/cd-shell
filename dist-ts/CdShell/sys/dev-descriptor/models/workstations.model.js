/* eslint-disable antfu/if-newline */
// import type { WorkstationDescriptor } from './dev-descriptor.model';
// import type { OperatingSystemDescriptor } from './app-descriptor.model';
import { cdApiDependencies, } from '../../dev-descriptor/models/dependancy-descriptor.model.js';
import { getOsByName, operatingSystems } from './os.model.js';
import { getPermissionsByRoleNames, roles, } from './permissions.model.js';
import { getSoftwareByName, softwareDataStore, } from './software-store.model.js';
import { getTestingFrameworkByContext, testingFrameworks, } from './testing-framework.model.js';
export const fileStorages = [
    {
        name: 'Basic Storage',
        type: 'local',
        fileStorageCapacity: {
            size: '500GB',
            autoScaling: false,
        },
        fileStorageLocation: {
            path: '/local/storage',
        },
        fileStorageAccess: {
            fileStorageAccessType: 'private',
            osPermissions: getPermissionsByRoleNames(['admin', 'user'], roles),
        },
    },
    {
        name: 'Advanced Storage',
        type: 'network',
        fileStorageCapacity: {
            size: '2TB',
            autoScaling: true,
            quota: {
                userLimit: '100GB',
            },
        },
        fileStorageLocation: {
            path: '\\\\network\\storage',
        },
        fileStorageAccess: {
            fileStorageAccessType: 'restricted',
            authentication: {
                type: 'role-based',
                credentials: {
                    roles: ['admin', 'user'],
                },
            },
        },
    },
    {
        name: 'Premium Storage',
        type: 'object-storage',
        fileStorageCapacity: {
            size: '5TB',
            autoScaling: true,
        },
        fileStorageLocation: {
            bucketName: 'premium-storage-bucket',
            region: 'us-east-1',
        },
        fileStorageAccess: {
            fileStorageAccessType: 'public',
        },
    },
    {
        name: 'Default Storage',
        type: 'distributed',
        fileStorageCapacity: {
            size: '1TB',
            autoScaling: true,
        },
        fileStorageLocation: {
            endpoints: ['endpoint1.example.com', 'endpoint2.example.com'],
        },
        fileStorageAccess: {
            fileStorageAccessType: 'restricted',
            authentication: {
                type: 'token-based',
                credentials: {
                    token: 'default-storage-token',
                },
            },
        },
    },
];
export var FileStorageOption;
(function (FileStorageOption) {
    FileStorageOption["Basic"] = "Basic Storage";
    FileStorageOption["Advanced"] = "Advanced Storage";
    FileStorageOption["Premium"] = "Premium Storage";
    FileStorageOption["Default"] = "Default Storage";
})(FileStorageOption || (FileStorageOption = {}));
export const workstations = [
    /**
     * local workstation for testing setting up
     * development and production environments
     */
    {
        name: 'emp-12',
        machineType: {
            name: 'physical',
            hostMachine: {
                systemResources: {
                    cpuCores: 4, // Number of CPU cores
                    memory: { units: 'GB', value: 32 }, // e.g., "32GB"
                    storage: { units: 'TB', value: 1 }, // e.g., "1TB"
                }, // Total physical resources
                networkInterfaces: [
                    {
                        hostname: 'localhost', // Hostname of the workstation
                        ip4Addresses: ['127.0.0.1', '192.168.1.6'], // List of IPv4 addresses
                    },
                    {
                        hostname: 'emp-12', // Hostname of the workstation
                        ip4Addresses: ['192.168.1.6'], // List of IPv4 addresses
                    },
                ], // Resources allocated to this container
            },
        },
        os: {
            name: 'Ubuntu',
            version: '22.04',
            architecture: 'x86_64',
            kernelVersion: '5.15.0-79-generic',
            distribution: 'Ubuntu',
            timezone: 'UTC',
        },
        workstationAccess: {
            accessScope: 'local',
            physicalAccess: 'direct',
            interactionType: 'cli',
        },
        requiredSoftware: cdApiDependencies,
    },
    /**
     * container based remote workstation for
     * testing setting up
     * development and production environments
     */
    {
        name: 'emp-13',
        machineType: {
            name: 'container',
            hostMachine: {
                containerId: 'emp-61',
                image: 'ubuntu22.04',
                allocatedResources: {
                    cpuCores: 1, // Number of CPU cores
                    memory: { units: 'GB', value: 4 }, // e.g., "32GB"
                    storage: { units: 'GB', value: 8 }, // e.g., "1TB"
                }, // Resources allocated to this container
            },
        },
        os: {
            name: 'Ubuntu',
            version: '22.04',
            architecture: 'x86_64',
            kernelVersion: '5.15.0-79-generic',
            distribution: 'Ubuntu',
            timezone: 'UTC',
        },
        workstationAccess: {
            accessScope: 'remote',
            physicalAccess: 'tunnel',
            transport: {
                protocol: 'ssh',
                credentials: {
                    sshCredentials: {
                        username: 'admin',
                        privateKey: '/keys/build-server-key',
                        host: '123.456.890',
                        port: 22,
                    },
                },
            },
            interactionType: 'cli',
        },
        requiredSoftware: cdApiDependencies,
    },
    {
        /**
         *
         */
        name: 'emp-12-cd-api',
        description: 'emp-12 laptop machine as host for cd-api',
        workstationAccess: {
            accessScope: 'local',
            physicalAccess: 'direct',
            interactionType: 'cli',
        },
        machineType: {
            name: 'physical',
            hostMachine: {
                containerId: 'ubuntu-03',
                image: 'ubuntu22.04',
                allocatedResources: {
                    cpuCores: 4, // Number of CPU cores
                    memory: { units: 'GB', value: 32 }, // e.g., "32GB"
                    storage: { units: 'TB', value: 1 }, // e.g., "1TB"
                }, // Resources allocated to this container
            },
        },
        os: getOsByName('ubuntu.22.04', operatingSystems)[0],
        enabled: true,
        requiredSoftware: getSoftwareByName(['npm.9.8.1', 'vscode.1.82.0'], softwareDataStore),
    },
    {
        name: 'Windows Build Server',
        workstationAccess: {
            accessScope: 'remote',
            physicalAccess: 'vpn',
            transport: {
                protocol: 'ssh',
                credentials: {
                    sshCredentials: {
                        username: 'admin',
                        privateKey: '/keys/build-server-key',
                        host: '123.456.890',
                        port: 22,
                    },
                },
            },
            interactionType: 'cli',
        },
        machineType: {
            name: 'container',
            hostMachine: {
                containerId: 'ubuntu-03',
                image: 'ubuntu22.04',
                allocatedResources: {
                    cpuCores: 1, // Number of CPU cores
                    memory: { units: 'GB', value: 4 }, // e.g., "32GB"
                    storage: { units: 'GB', value: 8 }, // e.g., "1TB"
                }, // Resources allocated to this container
            },
        },
        // container: ContainerDescriptor;
        os: getOsByName('Windows', operatingSystems)[0],
        enabled: true,
        requiredSoftware: getSoftwareByName(['pnpm.7.16.0', 'apache.2.4.57', 'mysql-server.8.0.34'], softwareDataStore),
    },
    {
        name: 'macOS Developer Laptop',
        workstationAccess: {
            accessScope: 'remote',
            physicalAccess: 'direct',
            transport: {
                protocol: 'ssh',
                credentials: {
                    sshCredentials: {
                        username: 'admin',
                        privateKey: '/keys/build-server-key',
                        host: '123.456.890',
                        port: 22,
                    },
                },
            },
            interactionType: 'cli',
        },
        machineType: {
            name: 'container',
            hostMachine: {
                containerId: 'ubuntu-03',
                image: 'ubuntu22.04',
                allocatedResources: {
                    cpuCores: 1, // Number of CPU cores
                    memory: { units: 'GB', value: 4 }, // e.g., "32GB"
                    storage: { units: 'GB', value: 8 }, // e.g., "1TB"
                }, // Resources allocated to this container
            },
        },
        os: getOsByName('macOS', operatingSystems)[0],
        enabled: true,
        requiredSoftware: getSoftwareByName(['vscode.1.82.0', 'npm.9.8.1', 'lxd.5.0'], softwareDataStore),
    },
    {
        name: 'CentOS Database Server',
        workstationAccess: {
            accessScope: 'remote',
            physicalAccess: 'direct',
            transport: {
                protocol: 'ssh',
                credentials: {
                    sshCredentials: {
                        username: 'admin',
                        privateKey: '/keys/build-server-key',
                        host: '123.456.890',
                        port: 22,
                    },
                },
            },
            interactionType: 'cli',
        },
        machineType: {
            name: 'container',
            hostMachine: {
                containerId: 'ubuntu-03',
                image: 'ubuntu22.04',
                allocatedResources: {
                    cpuCores: 1, // Number of CPU cores
                    memory: { units: 'GB', value: 4 }, // e.g., "32GB"
                    storage: { units: 'GB', value: 8 }, // e.g., "1TB"
                }, // Resources allocated to this container
            },
        },
        os: getOsByName('CentOS', operatingSystems)[0],
        enabled: true,
        requiredSoftware: getSoftwareByName(['mysql-server.8.0.34'], softwareDataStore),
    },
];
export const defaultWorkstation = {
    name: 'unknown',
    workstationAccess: {
        accessScope: 'local',
        physicalAccess: 'direct',
        transport: {
            protocol: 'ssh',
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
        name: 'container',
        hostMachine: {
            containerId: 'ubuntu-03',
            image: 'ubuntu22.04',
            allocatedResources: {
                cpuCores: 1, // Number of CPU cores
                memory: { units: 'GB', value: 4 }, // e.g., "32GB"
                storage: { units: 'GB', value: 8 }, // e.g., "1TB"
            }, // Resources allocated to this container
        },
    },
    os: getOsByName('ubuntu.22.04', operatingSystems)[0],
    enabled: true,
    requiredSoftware: getSoftwareByName(['npm.9.8.1', 'vscode.1.82.0'], softwareDataStore),
};
export const fileStorageOptions = [
    'Basic Storage',
    'Advanced Storage',
    'Premium Storage',
    'Default Storage',
];
export function getFileStoregeByName(names, fileStorages) {
    const storageMap = new Map(fileStorages.map((storage) => [storage.name, storage]));
    const defaultStorage = storageMap.get('Default Storage');
    const invalidRequests = [];
    const result = names
        .map((name) => {
        const storage = storageMap.get(name);
        if (!storage)
            invalidRequests.push(name);
        return storage;
    })
        .filter((storage) => !!storage);
    if (invalidRequests.length > 0) {
        console.warn('Invalid storage requests:', invalidRequests);
    }
    return result.length > 0 ? result : [defaultStorage];
}
export function getWorkstationByName(name, ws) {
    const ret = ws.find((workstation) => workstation.name === name);
    if (!ret) {
        return defaultWorkstation;
    }
    else {
        return ret;
    }
}
export const osPermissions = {
    basePermissions: getPermissionsByRoleNames([], roles),
    accessControls: [
        {
            subject: 'user:john',
            resource: '/home/john/docs',
            allowedActions: ['read', 'write'],
            conditions: [
                {
                    type: 'time-based',
                    details: { startTime: '09:00', endTime: '17:00' },
                },
            ],
        },
        {
            subject: 'group:developers',
            resource: '/var/app',
            allowedActions: ['read', 'write', 'execute'],
        },
    ],
    auditConfig: {
        logChanges: true,
        lastModifiedBy: 'admin',
        lastModifiedAt: new Date(),
        auditTrail: ['Initial setup', 'Added permissions for user:john'],
    },
    roles: [
        {
            roleName: 'admin',
            permissions: [
                {
                    name: 'manage_system',
                    description: 'Allows full control over the operating system',
                    level: 'system',
                    type: 'service',
                },
            ],
        },
    ],
};
export const CdApiSetupTasks = [
    {
        name: "installDependencies",
        type: "script-inline",
        executor: "bash",
        status: "pending",
        methodName: "installDependencies",
    },
    {
        name: "cloneRepositories",
        type: "script-inline",
        executor: "bash",
        status: "pending",
        methodName: "cloneRepositories",
    },
    {
        name: "configureServices",
        type: "script-inline",
        executor: "bash",
        status: "pending",
        methodName: "configureServices",
    },
    {
        name: "startServices",
        type: "script-inline",
        executor: "bash",
        status: "pending",
        methodName: "startServices",
    },
];
export const cdApiCiCd = {
    cICdPipeline: {
        name: 'Corpdesk CI/CD - Bash Deployment',
        type: 'deployment',
        stages: [
            {
                name: 'Setup Environment',
                description: 'Prepare the development environment',
                tasks: CdApiSetupTasks,
            },
        ],
    },
};
export const CdApiRepo = {
    repository: {
        name: 'cd-api',
        description: 'api for corpdesk. Also supprts cd-sio push server',
        url: 'https://github.com/corpdesk/cd-api.git',
        type: 'git',
        isPrivate: false,
        // directory: '~/', // NEW: Local directory where the repo should be cloned
        credentials: { repoHost: 'corpdesk', accessToken: '#CdVault' },
    },
};
export const emp12DevEnvironment = {
    workstation: getWorkstationByName('emp-12', workstations),
    versionControl: [CdApiRepo],
    ciCd: [cdApiCiCd],
    testingFrameworks: getTestingFrameworkByContext('cd-api', testingFrameworks),
};
export const emp13DevEnvironment = {
    workstation: {
        name: 'emp-13',
        machineType: {
            name: 'container',
            hostMachine: {
                containerId: 'emp-61',
                image: 'ubuntu22.04',
                allocatedResources: {
                    cpuCores: 1, // Number of CPU cores
                    memory: { units: 'GB', value: 4 }, // e.g., "32GB"
                    storage: { units: 'GB', value: 8 }, // e.g., "1TB"
                }, // Resources allocated to this container
            },
        },
        os: {
            name: 'Ubuntu',
            version: '22.04',
            architecture: 'x86_64',
            kernelVersion: '5.15.0-79-generic',
            distribution: 'Ubuntu',
            timezone: 'UTC',
        },
        workstationAccess: {
            accessScope: 'remote',
            physicalAccess: 'tunnel',
            transport: {
                protocol: 'ssh',
                credentials: {
                    sshCredentials: {
                        username: 'admin',
                        privateKey: '/keys/build-server-key',
                        host: '123.456.890',
                        port: 22,
                    },
                },
            },
            interactionType: 'cli',
        },
        requiredSoftware: cdApiDependencies,
    },
    versionControl: [CdApiRepo],
    ciCd: [cdApiCiCd],
    testingFrameworks: getTestingFrameworkByContext('cd-api', testingFrameworks),
};
// export const localProfile: ProfileModel = {
//   cdCliProfileName: 'Local Development - emp-12',
//   cdCliProfileData: {
//     owner: {
//       userId: 1001,
//       groupId: 1001,
//     },
//     type: 'local', // or the appropriate type string for your use case
//     typeId: 1, // or the appropriate typeId number for your use case
//     details: emp12DevEnvironment,
//     cdVault: [],
//     permissions: {
//       userPermissions: [],
//       groupPermissions: [],
//     },
//   },
//   cdCliProfileEnabled: 1,
//   cdCliProfileTypeId: 1,
//   userId: 1001,
// };
// export const remoteProfile: ProfileModel = {
//   cdCliProfileName: 'Remote Development - emp-120',
//   cdCliProfileData: {
//     owner: {
//       userId: 1002,
//       groupId: 1002,
//     },
//     type: 'remote', // or the appropriate type string for your use case
//     typeId: 2, // or the appropriate typeId number for your use case
//     details: emp13DevEnvironment,
//     cdVault: [
//       {
//         name: 'sshPrivateKey',
//         description: 'SSH key for accessing remote machine',
//         value: null,
//         encryptedValue: 'ENCRYPTED_SSH_KEY',
//         isEncrypted: true,
//       },
//     ],
//     permissions: {
//       userPermissions: [],
//       groupPermissions: [],
//     },
//   },
//   cdCliProfileEnabled: 1,
//   cdCliProfileTypeId: 2, // SSH profile type
//   userId: 1002,
// };
