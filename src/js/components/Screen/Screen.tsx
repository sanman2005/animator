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

const getPosition = (event: React.MouseEvent<HTMLDivElement>) => ({
  x: event.pageX,
  y: event.pageY,
});

export const Screen: React.FC<IScreenProps> = ({
  activeElementId,
  className,
  elements,
  onChangeElement,
  screen,
}) => {
  const [draggingElement, setDraggingElement] = React.useState<IScreenElement>(
    null,
  );
  const [lastDragPosition, setDragPosition] = React.useState<Vector>(null);
  const [draggingElementSize, setDraggingElementSize] = React.useState<Vector>(
    null,
  );

  const startDrag = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>, element: IScreenElement) => {
      const { offsetHeight, offsetWidth } = event.currentTarget;

      setDraggingElement(element);
      setDraggingElementSize({ x: offsetWidth, y: offsetHeight });
      setDragPosition(getPosition(event));
    },
    [],
  );

  const onMouseMove = React.useCallback(
    event => {
      if (!draggingElement) return;

      const newDragPosition = getPosition(event);
      const position = { ...draggingElement.position };

      position.x +=
        (100 * (newDragPosition.x - lastDragPosition.x)) /
        draggingElementSize.x;

      position.y +=
        (100 * (newDragPosition.y - lastDragPosition.y)) /
        draggingElementSize.y;

      setDragPosition(newDragPosition);

      onChangeElement({
        ...draggingElement,
        position,
      });
    },
    [draggingElement, onChangeElement],
  );

  const stopDrag = React.useCallback(() => setDraggingElement(null), []);

  return (
    <div className={cn(className, 'screenWrapper')}>
      <div
        className='screen'
        onMouseMoveCapture={onMouseMove}
        onMouseUpCapture={stopDrag}
        style={{ transform: screen && getElementTransform(screen) }}
      >
        {elements.map(element => (
          <div
            className={cn('screenElement', {
              'screenElement--active': activeElementId === element.id,
            })}
            key={element.id}
            onMouseDownCapture={event => startDrag(event, element)}
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
};
