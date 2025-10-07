/* eslint-disable style/indent */
// import type { DependencyDescriptor } from './app-descriptor.model';
export const dependencies = [
    {
        name: 'express',
        version: '^4.18.1',
        category: 'library',
        type: 'production',
        source: 'npm',
        scope: 'module',
        resolution: {
            method: 'require',
            path: 'node_modules/express',
            alias: 'express',
        },
        usage: {
            usageContext: 'api',
            functionsUsed: ['Router', 'json', 'urlencoded'],
        },
        // workstationAccess: {
        //   accessScope: 'local',
        //   physicalAccess: 'direct',
        //   // transport: { protocol: 'ssh', credentials: {} }, // transport is not necessary, accessing machine directly
        //   interactionType: 'cli',
        // },
        platformCompatibility: {
            languages: ['Node.js'],
            os: ['Linux', 'Windows', 'macOS'],
            architectures: ['x86_64', 'arm64'],
        },
        dependencyLifecycle: {
            loadTime: 'startup',
            updates: 'manual',
        },
        security: {
            isSecure: true,
            vulnerabilities: [],
        },
        dependencyMetadata: {
            description: 'Fast, unopinionated, minimalist web framework for Node.js',
            repository: 'https://github.com/expressjs/express',
            license: 'MIT',
            documentationUrl: 'https://expressjs.com/',
        },
    },
    {
        name: 'webpack',
        version: '5.75.0',
        category: 'tool',
        type: 'development',
        source: 'npm',
        scope: 'global',
        resolution: {
            method: 'cli',
        },
        usage: {
            usageContext: 'utility',
            functionsUsed: ['bundle', 'watch'],
        },
        platformCompatibility: {
            languages: ['Node.js', 'JavaScript'],
            os: ['Linux', 'Windows', 'macOS'],
        },
        dependencyLifecycle: {
            loadTime: 'manual',
            updates: 'automatic',
        },
        security: {
            isSecure: true,
            vulnerabilities: [],
        },
        dependencyMetadata: {
            description: 'A static module bundler for modern JavaScript applications.',
            repository: 'https://github.com/webpack/webpack',
            license: 'MIT',
            documentationUrl: 'https://webpack.js.org/',
        },
    },
    {
        name: 'stdio.h',
        version: 'default for headers',
        category: 'header',
        type: 'production',
        source: 'system',
        scope: 'local',
        resolution: {
            method: 'header',
            path: '/usr/include/stdio.h',
        },
        usage: {
            usageContext: 'utility',
            functionsUsed: ['printf', 'scanf'],
        },
        platformCompatibility: {
            languages: ['C'],
            os: ['Linux', 'Windows', 'macOS'],
        },
        dependencyLifecycle: {
            loadTime: 'startup',
            updates: 'manual',
        },
        security: {
            isSecure: true,
        },
        dependencyMetadata: {
            description: 'Standard Input/Output library for C programming.',
            license: 'Standard C Library',
        },
    },
    {
        name: 'React',
        version: '^18.2.0',
        category: 'framework',
        type: 'production',
        source: 'cdn',
        scope: 'module',
        resolution: {
            method: 'import',
            alias: 'React',
        },
        usage: {
            usageContext: 'controller',
            functionsUsed: ['useState', 'useEffect'],
            modulesUsed: ['ReactDOM', 'React'],
        },
        platformCompatibility: {
            languages: ['JavaScript', 'TypeScript'],
            os: ['Linux', 'Windows', 'macOS'],
        },
        dependencyLifecycle: {
            loadTime: 'lazy',
            updates: 'automatic',
        },
        security: {
            isSecure: true,
        },
        dependencyMetadata: {
            description: 'A JavaScript library for building user interfaces.',
            repository: 'https://github.com/facebook/react',
            license: 'MIT',
            documentationUrl: 'https://reactjs.org/',
        },
    },
    {
        name: 'pytest',
        version: '^7.2.0',
        category: 'tool',
        type: 'development',
        source: 'external',
        scope: 'module',
        resolution: {
            method: 'cli',
        },
        usage: {
            usageContext: 'test',
        },
        platformCompatibility: {
            languages: ['Python'],
            os: ['Linux', 'Windows', 'macOS'],
        },
        dependencyLifecycle: {
            loadTime: 'manual',
            updates: 'manual',
        },
        security: {
            isSecure: true,
        },
        dependencyMetadata: {
            description: 'A framework for writing and running Python tests.',
            repository: 'https://github.com/pytest-dev/pytest',
            license: 'MIT',
            documentationUrl: 'https://docs.pytest.org/',
        },
    },
    {
        name: 'NVIDIA CUDA Toolkit',
        version: '12.1',
        category: 'core',
        type: 'production',
        source: 'system',
        scope: 'global',
        resolution: {
            method: 'cli',
        },
        usage: {
            usageContext: 'core',
        },
        platformCompatibility: {
            languages: ['C++', 'Python'],
            os: ['Linux', 'Windows'],
            architectures: ['x86_64'],
        },
        dependencyLifecycle: {
            loadTime: 'startup',
            updates: 'manual',
        },
        security: {
            isSecure: true,
        },
        dependencyMetadata: {
            description: 'Development toolkit for GPU-accelerated applications.',
            repository: 'https://developer.nvidia.com/cuda-toolkit',
            license: 'Proprietary',
            documentationUrl: 'https://docs.nvidia.com/cuda/',
        },
    },
];
export const defaultDependency = {
    name: 'Unknown',
    category: 'unknown',
    type: 'production',
    source: 'unknown',
    scope: 'unknown',
};
export function getDependencyByName(names, resources) {
    const foundDependencies = names
        .map((name) => resources.find((dependency) => dependency.name === name))
        .filter((dependency) => !!dependency); // Filter out undefined
    const missingCount = names.length - foundDependencies.length;
    // Include defaultDependency only once if there are missing items
    if (missingCount > 0) {
        return [...foundDependencies, defaultDependency];
    }
    return foundDependencies;
}
/**
 * In assembling software for production or development environtment, a database can be developed
 * and maintained.
 * Future plans would be to automate maintenance.
 * The profile that has the basic environment descriptor can have an automated way of calling the database for
 * Standard collection of software based on which environment is being setup and in context of given application.
 * Below is a sample database for cd-api application.
 * In a more robust database, there would be ways for selecting version for every dependancy one is to select.
 */
export const cdApiDependencies = [
    {
        name: 'Node.js',
        version: '18.x',
        category: 'tool',
        type: 'development',
        source: 'npm',
        scope: 'global',
        resolution: { method: 'import', path: '/usr/bin/npm' },
        usage: { usageContext: 'cli' },
        platformCompatibility: {
            languages: ['JavaScript', 'Node.js'],
            os: ['Linux', 'Windows', 'macOS'],
        },
        security: { isSecure: true },
        dependencyMetadata: { description: 'Node package manager', license: 'MIT' },
    },
    {
        name: 'vscode.1.82.0',
        version: '1.82.0',
        category: 'tool',
        type: 'development',
        source: 'system',
        scope: 'local',
        resolution: { method: 'include', path: '/usr/local/bin/code' },
        usage: { usageContext: 'editor' },
        platformCompatibility: {
            os: ['Linux', 'Windows', 'macOS'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'Code editor by Microsoft',
            license: 'Custom',
        },
    },
    {
        name: 'pnpm.7.16.0',
        version: '7.16.0',
        category: 'tool',
        type: 'development',
        source: 'npm',
        scope: 'global',
        resolution: { method: 'import', path: '/usr/bin/pnpm' },
        usage: { usageContext: 'cli' },
        platformCompatibility: {
            languages: ['JavaScript', 'Node.js'],
            os: ['Linux', 'Windows', 'macOS'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'Fast, disk space-efficient package manager',
            license: 'MIT',
        },
    },
    {
        name: 'apache.2.4.57',
        version: '2.4.57',
        category: 'core',
        type: 'production',
        source: 'system',
        scope: 'global',
        resolution: { method: 'include', path: '/usr/sbin/apache2' },
        usage: { usageContext: 'api' },
        platformCompatibility: {
            os: ['Linux', 'Windows', 'macOS'],
            architectures: ['x86_64', 'arm64'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'Apache HTTP Server',
            license: 'Apache-2.0',
        },
    },
    {
        name: 'incus.1.2.3',
        version: '1.2.3',
        category: 'tool',
        type: 'production',
        source: 'system',
        scope: 'global',
        resolution: { method: 'cli', path: '/usr/local/bin/incus' },
        usage: { usageContext: 'utility' },
        platformCompatibility: {
            os: ['Linux'],
            architectures: ['x86_64', 'arm64'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'Container and VM management',
            license: 'Apache-2.0',
        },
    },
    {
        name: 'mysql-server.8.0.34',
        version: '8.0.34',
        category: 'core',
        type: 'production',
        source: 'system',
        scope: 'global',
        resolution: { method: 'include', path: '/usr/bin/mysql' },
        usage: { usageContext: 'service' },
        platformCompatibility: {
            os: ['Linux', 'Windows', 'macOS'],
            architectures: ['x86_64', 'arm64'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'Relational database management system',
            license: 'GPL',
        },
    },
    {
        name: 'TypeScript',
        version: 'latest',
        category: 'library',
        type: 'development',
        source: 'npm',
        scope: 'global',
        resolution: { method: 'import', path: '/usr/bin/tsc' },
        usage: { usageContext: 'cli' },
        installCommand: 'npm install -g typescript',
        platformCompatibility: {
            languages: ['JavaScript', 'TypeScript'],
            os: ['Linux', 'Windows', 'macOS'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'TypeScript compiler for JavaScript development',
            license: 'Apache-2.0',
        },
    },
    {
        name: 'Redis',
        version: 'latest',
        category: 'core',
        type: 'production',
        source: 'system',
        scope: 'global',
        resolution: { method: 'include', path: '/usr/bin/redis-server' },
        usage: { usageContext: 'service' },
        installCommand: 'sudo apt install redis-server -y',
        platformCompatibility: {
            os: ['Linux', 'Windows', 'macOS'],
            architectures: ['x86_64', 'arm64'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'In-memory key-value store for caching and message brokering',
            license: 'BSD-3-Clause',
        },
    },
    {
        name: 'Git',
        version: 'latest',
        category: 'tool',
        type: 'development',
        source: 'system',
        scope: 'global',
        resolution: { method: 'cli', path: '/usr/bin/git' },
        usage: { usageContext: 'version-control' },
        installCommand: 'sudo apt install git -y',
        platformCompatibility: {
            os: ['Linux', 'Windows', 'macOS'],
            architectures: ['x86_64', 'arm64'],
        },
        security: { isSecure: true },
        dependencyMetadata: {
            description: 'Distributed version control system',
            license: 'GPL-2.0',
        },
    },
];
