export const testingFrameworks = [
    {
        name: 'Jest',
        description: 'A delightful JavaScript testing framework with a focus on simplicity.',
        type: 'unit',
        language: 'JavaScript',
        tools: ['Puppeteer'],
        testingFeatures: {
            assertions: true,
            mocking: true,
            parallelExecution: true,
            codeCoverage: true,
        },
        popularityRank: 1,
        context: ['cd-api', 'cd-api-dev-env', 'cd-cli'],
    },
    {
        name: 'Mocha',
        description: 'A flexible JavaScript test framework for Node.js and the browser.',
        type: 'unit',
        language: 'JavaScript',
        tools: ['Chai', 'Sinon'],
        testingFeatures: {
            assertions: true,
            mocking: true,
            customExtensions: true,
        },
        popularityRank: 2,
        context: ['cd-api', 'cd-api-dev-env'],
    },
    {
        name: 'Cypress',
        description: 'An end-to-end testing framework built for the modern web.',
        type: 'end-to-end',
        language: 'JavaScript',
        tools: ['Cypress Dashboard'],
        testingFeatures: {
            assertions: true,
            mocking: true,
            parallelExecution: true,
        },
        popularityRank: 3,
        context: ['cd-ui'],
    },
    {
        name: 'JUnit',
        description: 'A widely used testing framework for Java applications.',
        type: 'unit',
        language: 'Java',
        tools: ['JUnit 5'],
        testingFeatures: {
            assertions: true,
            mocking: true,
            parallelExecution: true,
            codeCoverage: true,
        },
        popularityRank: 4,
        context: ['cd-backend'],
    },
];
export const defaultTestingFramework = {
    name: 'JUnit',
    description: 'A widely used testing framework for Java applications.',
    type: 'unit',
    language: 'Java',
    tools: ['JUnit 5'],
    testingFeatures: {
        assertions: true,
        mocking: true,
        parallelExecution: true,
        codeCoverage: true,
    },
    popularityRank: 4,
    context: ['cd-backend'],
};
/**
 * Usage:
 * const result = getTestingFramework(["Mocha", "Nonexistent Framework"], knownTestingFrameworks);
 * console.log(result);
 *
 * @param names
 * @param frameworks
 * @returns
 */
export function getTestingFramework(names, frameworks) {
    return frameworks.filter((framework) => framework.name && names.includes(framework.name));
}
export function getTestingFrameworkByContext(context, frameworks) {
    return frameworks.filter((framework) => framework.context && framework.context.includes(context));
}
