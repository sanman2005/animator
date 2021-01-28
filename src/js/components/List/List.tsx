import * as React from 'react';
import cn from 'classnames';

import { getColClasses, ColumnProps } from '../Grid/Grid';
import Empty from '../Empty/Empty';

import i18n from 'js/i18n';

interface IListProps {
  children?: React.ReactNode[];
  className?: string;
  classItem?: string;
  emptyText?: React.ReactNode;
  grid?: boolean;
  items?: React.ReactNode[];
  title?: string;
}

export default (props: IListProps & ColumnProps) => {
  const { children, className, classItem, emptyText, grid, items, title } = props;
  const listItems = items || children;
  const itemClass = cn(
    classItem,
    {
      column: grid,
      [`${className}__item`]: className,
    },
    grid ? getColClasses(props) : '',
  );

  return (
    <>
      {title && <div className='title'>{title}</div>}
      <ul className={cn(className, { row: grid })}>
        {listItems.length
          ? listItems.map((item, index) =>
            <li key={index} className={itemClass}>{item}</li>)
          : <Empty text={emptyText || i18n`listEmpty`} />
        }
      </ul>
    </>
  );
};
