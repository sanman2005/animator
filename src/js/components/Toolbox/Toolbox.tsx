import * as React from 'react';
import cn from 'classnames';

export interface IToolboxItem {
  id: string;
  content: React.ReactNode;
}

interface IToolboxProps {
  activeItemId?: string;
  children?: React.ReactNode;
  className?: string;
  items?: IToolboxItem[];
  position: 'left' | 'right' | 'top' | 'bottom';
  withScroll?: boolean;
}

export const Toolbox: React.FC<IToolboxProps> = ({
  activeItemId,
  children,
  className,
  items,
  position,
  withScroll,
}) => (
  <div
    className={cn(className, 'toolbox', `toolbox--${position}`, {
      'toolbox--column': ['left', 'right'].includes(position),
      'toolbox--row': ['top', 'bottom'].includes(position),
      'toolbox--with-scroll': withScroll,
    })}
  >
    {items?.map(item => (
      <div
        className={cn('toolbox__item', {
          'toolbox__item--active': activeItemId === item.id,
        })}
        key={item.id}
      >
        {item.content}
      </div>
    ))}

    {children}
  </div>
);
