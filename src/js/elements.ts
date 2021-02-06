const images = (require as any).context(
  'img/elements/',
  true,
  /\.(png|jpe?g|gif)$/,
);
const elements: any = {};

images.keys().forEach((fileName: string) => {
  const {
    ext,
    folder,
    name,
  } = /^\.\/(?<folder>.*)\/(?<name>.*?)\.(?<ext>.+)$/.exec(fileName).groups;

  if (!folder || !name) return;

  elements[folder] = [
    ...(elements[folder] || []),
    `/img/elements/${folder}/${name}.${ext}`,
  ];
});

export default elements;
