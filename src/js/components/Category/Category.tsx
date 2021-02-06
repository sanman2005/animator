import * as React from 'react';
import cn from 'classnames';

interface ICategoryProps {
  content: React.ReactNode;
  contentPosition?: 'bottom' | 'left' | 'right' | 'top';
}

export const Category: React.FC<ICategoryProps> = ({
  children,
  content,
  contentPosition = 'right',
}) => (
  <div className='category'>
    {children}
    <div
      className={cn(
        'category__content-wrapper',
        `category__content-wrapper--${contentPosition}`,
      )}
    >
      <div className='category__content'>{content}</div>
    </div>
  </div>
);
