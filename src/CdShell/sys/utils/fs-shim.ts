export const promises = {
  readFile: async (path: string): Promise<Buffer> => {
    throw new Error('fs.readFile not available in browser');
  },
  writeFile: async (path: string, data: any): Promise<void> => {
    throw new Error('fs.writeFile not available in browser');
  },
  mkdir: async (path: string, options?: any): Promise<void> => {
    throw new Error('fs.mkdir not available in browser');
  },
  readdir: async (path: string): Promise<string[]> => {
    throw new Error('fs.readdir not available in browser');
  },
  unlink: async (path: string): Promise<void> => {
    throw new Error('fs.unlink not available in browser');
  },
  rm: async (path: string, options?: any): Promise<void> => {
    throw new Error('fs.rm not available in browser');
  },
};

export const existsSync = (path: string): boolean => false;
export const readFileSync = (path: string): Buffer => {
  throw new Error('fs.readFileSync not available in browser');
};

export default { promises, existsSync, readFileSync };