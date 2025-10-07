// import type { ServiceCost } from './service.model';
// import type { LicenseDescriptor } from './app-descriptor.model';
// Example Licenses
export const mitLicense = {
    type: 'openSource',
    licenseName: 'MIT',
    licenseLink: 'https://opensource.org/licenses/MIT',
};
export const commercialLicense = {
    type: 'commercial',
    licenseLink: 'https://example.com/licenses/commercial-license',
    cost: {
        type: 'paid',
        amount: 1000,
        currency: 'USD',
    },
};
export const customLicense = {
    type: 'custom',
    terms: 'This software is provided under a custom agreement. Contact us for details.',
};
// Default License
export const defaultLicense = {
    type: 'openSource',
    licenseName: 'Apache-2.0',
    licenseLink: 'https://opensource.org/licenses/Apache-2.0',
};
// Array of Licenses
export const licenses = [
    mitLicense,
    commercialLicense,
    customLicense,
    defaultLicense,
];
// Function to Get License by Name
export function getLicenseByName(name, licenses) {
    return (licenses.find((license) => license.licenseName?.toLowerCase() === name.toLowerCase()) || defaultLicense);
}
// Example Usage
const selectedLicense = getLicenseByName('MIT', licenses);
console.log(selectedLicense);
const unknownLicense = getLicenseByName('Unknown License', licenses);
console.log(unknownLicense); // Returns defaultLicense
