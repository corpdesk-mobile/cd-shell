// import type { DependencyDescriptor } from './app-descriptor.model';
/**
 * cd-api Services:
    ----------------
    apache
    nginx
    mysql
    redis
    cd-api system service
    cd-sio system service
    ssh-server
 */
// export const services: SystemServiceDescriptor[] = [
//   {
//     serviceName: 'redis',
//     context: ['cd-api', 'cd-api-dev-env', 'cd-cli'],
//     serviceType: 'storage',
//     osServiceManager: 'systemd',
//     command: 'sudo service redis-server start', // Execution command
//     workstationAccess: {
//       accessScope: 'local',
//       physicalAccess: 'direct',
//       interactionType: 'cli',
//     },
//     /**
//      *  # bind 192.168.1.100 10.0.0.1     # listens on two specific IPv4 addresses
//         # bind 127.0.0.1 ::1              # listens on loopback IPv4 and IPv6
//         # bind * -::*                     # like the default, all available interfaces
//         # Accept connections on the specified port, default is 6379 (IANA #815344).
//         # If port 0 is specified Redis will not listen on a TCP socket.
//         port 6379
//      */
//     // configuration?: Record<string, any>; // Service-specific settings
//   },
//   {
//     serviceName: 'mysql',
//     context: ['cd-api', 'cd-api-dev-env'],
//     serviceType: 'storage',
//     osServiceManager: 'systemd',
//     command: 'sudo service mysql start', // Execution command
//     workstationAccess: {
//       accessScope: 'local',
//       physicalAccess: 'direct',
//       interactionType: 'cli',
//     },
//     /**
//      *  port = 3306
//         # localhost which is more compatible and is not less secure.
//         bind-address            = 0.0.0.0
//      */
//     // configuration?: Record<string, any>; // Service-specific settings
//   },
// ];
// export interface PortMapping extends BaseDescriptor {
//   containerPort: number; // Port inside the container/application
//   hostPort?: number; // Port exposed on the host
//   protocol: 'TCP' | 'UDP' | 'unknown'; // Protocol type
//   ingress?: IngressConfig; // Ingress rules for this port
//   egress?: EgressConfig; // Egress rules for this port
// }
export const services = [
    {
        serviceName: 'redis',
        context: ['cd-api', 'cd-api-dev-env', 'cd-cli'],
        serviceType: 'storage',
        osServiceManager: 'systemd',
        command: 'sudo service redis-server start', // Execution command
        workstationAccess: {
            accessScope: 'local',
            physicalAccess: 'direct',
            interactionType: 'cli',
        },
        networkConfig: [
            {
                name: 'Redis Localhost',
                context: ['cd-api', 'cd-api-dev-env', 'cd-cli'],
                hostname: 'localhost',
                ip4Addresses: ['127.0.0.1'],
                servicePorts: {
                    portMapping: [{ port: 6379, protocol: 'TCP' }],
                },
            },
            {
                name: 'Redis External',
                context: ['cd-api', 'cd-api-dev-env'],
                hostname: 'redis.cd-api.local',
                ip4Addresses: ['192.168.1.100', '10.0.0.1'],
                publicUrl: 'redis://redis.cd-api.local:6379',
            },
        ],
    },
    {
        serviceName: 'mysql',
        context: ['cd-api', 'cd-api-dev-env'],
        serviceType: 'storage',
        osServiceManager: 'systemd',
        command: 'sudo service mysql start', // Execution command
        workstationAccess: {
            accessScope: 'local',
            physicalAccess: 'direct',
            interactionType: 'cli',
        },
        networkConfig: [
            {
                name: 'MySQL Localhost',
                context: ['cd-api', 'cd-api-dev-env'],
                hostname: 'localhost',
                ip4Addresses: ['127.0.0.1'],
                servicePorts: {
                    portMapping: [{ port: 3306, protocol: 'TCP' }],
                },
            },
            {
                name: 'MySQL External',
                context: ['cd-api', 'cd-api-dev-env'],
                hostname: 'mysql.cd-api.local',
                ip4Addresses: ['0.0.0.0'],
                publicUrl: 'mysql://mysql.cd-api.local:3306',
            },
        ],
    },
];
export const defaultService = {
    serviceName: 'unknown',
    serviceType: 'unknown',
    command: 'sudo service redis-server start', // Execution command
    workstationAccess: {
        accessScope: 'local',
        physicalAccess: 'direct',
        interactionType: 'cli',
    },
};
export function getServiceByName(names, resources) {
    const foundServices = resources.filter((service) => names.some((name) => service.serviceName.toLowerCase() === name.toLowerCase()));
    return foundServices.length > 0 ? foundServices : [defaultService];
}
