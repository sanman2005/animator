import * as React from 'react';
import { observer } from 'mobx-react';
import Slider from '../Slider';
import { IFeature } from '../../models/feature';
import Utp from '../../models/utp';
import Class from '../../models/class';
import Loading from '../Loading';
import { ModelStatus } from '../../models';

export default observer((props: { type?: 'class' }) => {
  const isClassPage = props.type === 'class';
  const itemsData = props.type === 'class' ? Utp.all(Class) : Utp.all();
  const items = itemsData.value;

  if (!items) {
    return itemsData.status === ModelStatus.fetching && <Loading />;
  }

  const itemClass = 'feature';

  const listItems = items.map((item: IFeature, index: number) => (
    <div className={itemClass} key={`${itemClass}-${index}`}>
      <div className={`${itemClass}__icon`}>
        <img src={item.icon} alt='' />
      </div>
      <div className={`${itemClass}__content`}>
        <div className={`${itemClass}__title`}>{item.title}</div>
        {!isClassPage && <div className={`${itemClass}__desc`}>{item.desc}</div>}
      </div>
    </div>
  ));
  const sliderProps = {
    items: listItems,
    className: 'features row',
    countLg: 3,
    countSm: 2,
    countXs: 1,
  };

  return !!listItems.length && <Slider {...sliderProps} />;
});
