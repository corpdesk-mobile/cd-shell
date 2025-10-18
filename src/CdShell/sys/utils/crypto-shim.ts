export const randomBytes = (size: number): Buffer => {
  const array = new Uint8Array(size);
  crypto.getRandomValues(array);
  return Buffer.from(array);
};

export const createHash = (algorithm: string) => {
  return {
    update: (data: string) => ({ 
      digest: () => {
        // Simple hash implementation for browser
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          hash = ((hash << 5) - hash) + data.charCodeAt(i);
          hash |= 0;
        }
        return hash.toString(16);
      }
    })
  };
};

export default { randomBytes, createHash };