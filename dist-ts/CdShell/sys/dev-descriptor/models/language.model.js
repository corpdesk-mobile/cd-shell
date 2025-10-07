// import type { LanguageDescriptor } from './dev-descriptor.model';
export var LanguageName;
(function (LanguageName) {
    LanguageName["TypeScript"] = "TypeScript";
    LanguageName["Cpp"] = "C++";
    LanguageName["Python"] = "Python";
    LanguageName["JavaScript"] = "JavaScript";
    LanguageName["Java"] = "Java";
    LanguageName["Go"] = "Go";
    LanguageName["Rust"] = "Rust";
    LanguageName["Ruby"] = "Ruby";
    LanguageName["PHP"] = "PHP";
    LanguageName["CSharp"] = "C#";
})(LanguageName || (LanguageName = {}));
export const languages = [
    {
        name: LanguageName.TypeScript,
        version: '5.0',
        type: 'hybrid',
        fileProfiles: [
            { profileName: 'tsSource', extension: '.ts', stage: 'source', standard: 'ECMAScript 6+', tooling: ['tsc'] },
            { profileName: 'tsCompiled', extension: '.js', stage: 'transpiled', standard: 'ECMAScript 6+', tooling: ['node'] },
        ],
        languageEcosystem: {
            defaultPackageManager: 'npm',
            frameworks: ['Angular', 'NestJS', 'React'],
        },
        languageParadigms: { supportsOOP: true, supportsFunctional: true },
        languageTooling: {
            buildTools: ['webpack', 'tsc'],
            testingFrameworks: ['jest'],
            linters: ['eslint'],
        },
        languageFeatures: {
            staticTyping: true,
            dynamicTyping: false,
            memoryManagement: 'garbageCollection',
        },
    },
    {
        name: LanguageName.Cpp,
        version: 'C++20',
        type: 'compiled',
        fileProfiles: [
            { profileName: 'cppSource', extension: '.cpp', stage: 'source', standard: 'C++20', tooling: ['g++'] },
            { profileName: 'hSource', extension: '.h', stage: 'source', standard: 'C++20' },
            { profileName: 'oBinary', extension: '.o', stage: 'intermediate', tooling: ['ld'] },
            { profileName: 'execBin', extension: '.exe', stage: 'executable' },
        ],
        languageEcosystem: { defaultPackageManager: 'conan' },
        languageParadigms: { supportsOOP: true, supportsProcedural: true, supportsConcurrent: true },
        languageFeatures: { staticTyping: true, memoryManagement: 'manual' },
    },
];
export const defaultLanguage = {
    name: LanguageName.TypeScript,
    fileProfiles: [{ extension: '.ts', stage: 'source', standard: 'ECMAScript 6+' }],
};
export function getLanguageByName(name, languages) {
    return languages.find((language) => language.name === name) || defaultLanguage;
}
/**
 * Extracts a file extension for a given language name and profile.
 * @param name - The language name (enum LanguageName).
 * @param languages - The array of LanguageDescriptor objects.
 * @param fileProfileName - The profileName to search within the language's fileProfiles.
 * @returns CdFxReturn<string | null> - The extension if found, otherwise null.
 */
export function getExtensionByLangProfile(name, languages, fileProfileName) {
    const lang = languages.find(l => l.name === name);
    if (!lang) {
        return { state: false, data: null, message: `Language ${name} not found.` };
    }
    const profile = lang.fileProfiles.find(fp => fp.profileName === fileProfileName);
    if (!profile) {
        return { state: false, data: null, message: `Profile ${fileProfileName} not found for language ${name}.` };
    }
    return { state: true, data: profile.extension, message: 'Extension retrieved successfully.' };
}
