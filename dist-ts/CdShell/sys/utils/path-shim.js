export const resolve = (...paths) => paths.join('/');
export const join = (...paths) => paths.join('/');
export const dirname = (path) => path.split('/').slice(0, -1).join('/') || '.';
export const basename = (path, ext) => {
    const name = path.split('/').pop() || '';
    return ext && name.endsWith(ext) ? name.slice(0, -ext.length) : name;
};
export const extname = (path) => {
    const base = basename(path);
    const dotIndex = base.lastIndexOf('.');
    return dotIndex > 0 ? base.slice(dotIndex) : '';
};
export default { resolve, join, dirname, basename, extname };
