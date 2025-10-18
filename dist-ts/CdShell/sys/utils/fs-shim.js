export const promises = {
    readFile: async (path) => {
        throw new Error('fs.readFile not available in browser');
    },
    writeFile: async (path, data) => {
        throw new Error('fs.writeFile not available in browser');
    },
    mkdir: async (path, options) => {
        throw new Error('fs.mkdir not available in browser');
    },
    readdir: async (path) => {
        throw new Error('fs.readdir not available in browser');
    },
    unlink: async (path) => {
        throw new Error('fs.unlink not available in browser');
    },
    rm: async (path, options) => {
        throw new Error('fs.rm not available in browser');
    },
};
export const existsSync = (path) => false;
export const readFileSync = (path) => {
    throw new Error('fs.readFileSync not available in browser');
};
export default { promises, existsSync, readFileSync };
