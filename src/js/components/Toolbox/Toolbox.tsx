import * as React from 'react';
import cn from 'classnames';

export interface IToolboxItem {
  id: string;
  content: React.ReactNode;
}

interface IToolboxProps {
  activeItemId?: string;
  className?: string;
  items: IToolboxItem[];
  position: 'left' | 'right' | 'top' | 'bottom';
}

export const Toolbox: React.FC<IToolboxProps> = ({
  activeItemId,
  className,
  items,
  position,
}) => (
  <ul
    className={cn(className, 'toolbox', `toolbox--${position}`, {
      'toolbox--column': ['left', 'right'].includes(position),
    })}
  >
    {items.map(item => (
      <li
        className={cn('toolbox__item', {
          'toolbox__item--active': activeItemId === item.id,
        })}
        key={item.id}
      >
        {item.content}
      </li>
    ))}
  </ul>
);
