import * as React from 'react';

interface IElementProps {
  image: string;
  onClick: () => void;
  onClickRight?: () => void;
}

export const Element: React.FC<IElementProps> = ({
  image,
  onClick,
  onClickRight,
}) => (
  <div
    className='element'
    onMouseDown={onClick}
    onContextMenu={(event: React.MouseEvent) => {
      event.preventDefault();
      onClickRight && onClickRight();
    }}
  >
    <img src={image} alt='' />
  </div>
);
