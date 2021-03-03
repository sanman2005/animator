import React from 'react';

import Icons from 'components/icons';

interface IElementProps {
  image: string;
  onEdit?: () => void;
  onClick: () => void;
  onClickRight?: () => void;
}

export const Element: React.FC<IElementProps> = ({
  image,
  onEdit,
  onClick,
  onClickRight,
}) => (
  <div
    className='element'
    onClick={onClick}
    onContextMenu={(event: React.MouseEvent) => {
      event.preventDefault();
      onClickRight && onClickRight();
    }}
  >
    <img src={image} alt='' />

    {onEdit && (
      <div
        className='element__edit'
        onClick={event => {
          event.stopPropagation();
          onEdit();
        }}
      >
        <Icons.settings />
      </div>
    )}
  </div>
);
