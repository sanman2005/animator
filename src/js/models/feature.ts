import Model from '.';

export interface IFeature {
  icon: string;
  title: string;
  desc?: string;
}

export class Feature extends Model<IFeature> {
  apiPath = 'features';

  get mock(): IFeature[] {
    return [
      {
        icon: '',
        title: 'title1',
        desc: 'desc1',
      },
      {
        icon: '',
        title: 'title2',
        desc: 'desc2',
      },
    ];
  }

  parseItem = (item: any): IFeature => ({
    title: item.title,
    desc: item.description,
    icon: item.image.contentUrl,
  })
}

export default new Feature();
