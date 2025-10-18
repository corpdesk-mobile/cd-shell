export const inspect = (obj: any, options?: any): string => {
  return JSON.stringify(obj, null, 2);
};

export const format = (...args: any[]): string => {
  return args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
};

export const promisify = (fn: Function) => {
  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
};

export default { inspect, format, promisify };