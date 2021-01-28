import * as React from 'react';
import cn from 'classnames';

import List from '../List';

interface ISwitcherProps {
  activeIndex?: number;
  className?: string;
  items: React.ReactNode[];
  onSwitch?: (index: number) => void;
  theme?: 'compact';
}

const switcher = (props: ISwitcherProps) => {
  const { activeIndex, className, items, onSwitch, theme } = props;

  return (
    <div className={cn(className, 'switcher', {
      [`switcher--${theme}`]: theme,
    })}>
      <List className='switcher-list' grid={!theme} xs={6}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn('switcher__item', {
              'switcher__item--active': activeIndex === index,
            })}
            onClick={onSwitch ? () => onSwitch(index) : null}
          >
            {item}
          </div>
        ))}
      </List>
    </div>
  );
};

switcher.defaultProps = {
  activeIndex: 0,
};

export default switcher;
