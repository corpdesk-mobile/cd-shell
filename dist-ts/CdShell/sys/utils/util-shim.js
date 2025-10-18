export const inspect = (obj, options) => {
    return JSON.stringify(obj, null, 2);
};
export const format = (...args) => {
    return args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
};
export const promisify = (fn) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn(...args, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    };
};
export default { inspect, format, promisify };
