import * as React from 'react';
import cn from 'classnames';

const DIMENSION = '%';

export interface Vector {
  x: number;
  y: number;
}

export interface IElement {
  position: Vector;
  rotation: number;
  scale: Vector;
}

export interface IScreenElement extends IElement {
  id: string | number;
  content: React.ReactNode;
  height: number;
  width: number;
}

interface IScreenProps {
  className?: string;
  elements: IScreenElement[];
  screen?: IElement;
}

const getElementTransform = (element: IElement) =>
  `translate(${element.position.x}${DIMENSION}) ` +
  `translateY(${element.position.y}${DIMENSION}) ` +
  `scaleX(${element.scale.x}) ` +
  `scaleY(${element.scale.y}) ` +
  `rotateZ(${element.rotation}) `;

export const Screen: React.FC<IScreenProps> = ({
  className,
  elements,
  screen,
}) => (
  <div className={cn(className, 'screenWrapper')}>
    <div
      className='screen'
      style={{ transform: screen && getElementTransform(screen) }}
    >
      {elements.map(element => (
        <div
          key={element.id}
          style={{
            transform: getElementTransform(element),
            width: `${element.width}${DIMENSION}`,
            height: `${element.height}${DIMENSION}`,
            left: `calc(50% + ${element.width / 2}px)`,
            top: `calc(50% + ${element.height / 2}px)`,
          }}
        >
          {element.content}
        </div>
      ))}
    </div>
  </div>
);
