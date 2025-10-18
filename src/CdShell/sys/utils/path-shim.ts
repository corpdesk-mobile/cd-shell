export const resolve = (...paths: string[]) => paths.join('/');
export const join = (...paths: string[]) => paths.join('/');
export const dirname = (path: string) => path.split('/').slice(0, -1).join('/') || '.';
export const basename = (path: string, ext?: string) => {
  const name = path.split('/').pop() || '';
  return ext && name.endsWith(ext) ? name.slice(0, -ext.length) : name;
};
export const extname = (path: string) => {
  const base = basename(path);
  const dotIndex = base.lastIndexOf('.');
  return dotIndex > 0 ? base.slice(dotIndex) : '';
};

export default { resolve, join, dirname, basename, extname };