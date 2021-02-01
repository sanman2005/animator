import * as React from 'react';
import cn from 'classnames';

export interface Vector {
  x: number;
  y: number;
}

interface IElement {
  position: Vector;
  rotation: number;
  scale: Vector;
}

export interface IScreenElement extends IElement {
  id: string;
  idToolbox: string;
  content: React.ReactNode;
  height: number;
  width: number;
}

interface IScreenProps {
  activeElementId?: string;
  className?: string;
  elements: IScreenElement[];
  onChangeElement?: (element: IScreenElement) => void;
  screen?: IElement;
}

const getElementTransform = (element: IElement) =>
  `translate(${element.position.x}%, ${element.position.y}%) ` +
  `scale(${element.scale.x}, ${element.scale.y}) ` +
  `rotateZ(${element.rotation}deg) `;

export const Screen: React.FC<IScreenProps> = ({
  activeElementId,
  className,
  elements,
  onChangeElement,
  screen,
}) => (
  <div className={cn(className, 'screenWrapper')}>
    <div
      className='screen'
      style={{ transform: screen && getElementTransform(screen) }}
    >
      {elements.map(element => (
        <div
          className={cn('screenElement', {
            'screenElement--active': activeElementId === element.id,
          })}
          key={element.id}
          onWheel={event => {
            const angle = 5 * (event.deltaY < 0 ? 1 : -1);
            const rotation = (element.rotation + angle) % 360;

            onChangeElement({ ...element, rotation });
          }}
          style={{
            transform: getElementTransform(element),
            width: `${element.width}%`,
            height: `${element.height}%`,
            left: `calc(50% - ${element.width / 2}%)`,
            top: `calc(50% - ${element.height / 2}%)`,
          }}
        >
          {element.content}
        </div>
      ))}
    </div>
  </div>
);
