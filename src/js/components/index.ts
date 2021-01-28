const components: any = {};

function importAll (r: any) {
  r.keys().forEach((key: any) => components[key.replace(/^\.\/(.*?)\/index\.tsx?$/, '$1')] = r(key).default);
}

importAll((require as any).context('./', true, /\.tsx$/));

export default components;
