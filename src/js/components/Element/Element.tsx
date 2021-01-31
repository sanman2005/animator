import * as React from 'react';

interface IElementProps {
  image: string;
  onClick: () => void;
}

export const Element: React.FC<IElementProps> = ({ image, onClick }) => (
  <div className='element' onClick={onClick}>
    <img src={image} alt='' />
  </div>
);
