const svgFiles = (require as any).context('../../img/svg', true, /\.svg$/);
const icons: any = {};

svgFiles.keys().forEach((fileName: string) => {
  const search = /^(.*)\/(.*?)\.svg$/.exec(fileName);

  if (!search || !search[2]) {
    return;
  }

  const { 1: path, 2: icon } = search;
  const pathName = path.replace(/^.\/?/, '').replace(/\//g, '_');
  const name = `${pathName ? `${pathName}_` : ''}${icon}`;

  icons[name] = svgFiles(fileName);
});

export default icons;
