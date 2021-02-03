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
  idTemplate: string;
  content: React.ReactNode;
  height: number;
  width: number;
}

interface IScreenProps {
  activeElementId?: string;
  className?: string;
  elements: IScreenElement[];
  onChangeElement?: (element: IScreenElement) => void;
  onScreenClick?: () => void;
  screen?: IElement;
}

const getElementTransform = (element: IElement) =>
  `translate(${element.position.x}%, ${element.position.y}%) ` +
  `rotateZ(${element.rotation}deg) ` +
  `scale(${element.scale.x}, ${element.scale.y}) `;

const getPosition = (event: React.MouseEvent<HTMLDivElement>) => ({
  x: event.pageX,
  y: event.pageY,
});

export const Screen: React.FC<IScreenProps> = ({
  activeElementId,
  className,
  elements,
  onChangeElement,
  onScreenClick,
  screen,
}) => {
  const [draggingElement, setDraggingElement] = React.useState<IScreenElement>(
    null,
  );
  const [resizingElement, setResizingElement] = React.useState<IScreenElement>(
    null,
  );
  const [lastPosition, setPosition] = React.useState<Vector>(null);
  const [editingElementSize, setEditingElementSize] = React.useState<Vector>(
    null,
  );

  const rotateElement = React.useCallback(
    (event: React.WheelEvent, element: IScreenElement) => {
      const angle = 5 * (event.deltaY < 0 ? 1 : -1);
      const rotation = (element.rotation + angle) % 360;

      onChangeElement({ ...element, rotation });
    },
    [],
  );

  const startEdit = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>, element: IScreenElement) => {
      const { offsetHeight, offsetWidth } = event.currentTarget;

      if (event.button) {
        event.stopPropagation();
        event.preventDefault();
        setResizingElement(element);
      } else {
        setDraggingElement(element);
      }

      setEditingElementSize({ x: offsetWidth, y: offsetHeight });
      setPosition(getPosition(event));
    },
    [],
  );

  const onMouseMove = React.useCallback(
    event => {
      const currentPosition = getPosition(event);

      if (draggingElement) {
        const position = { ...draggingElement.position };

        position.x +=
          (100 * (currentPosition.x - lastPosition.x)) / editingElementSize.x;

        position.y +=
          (100 * (currentPosition.y - lastPosition.y)) / editingElementSize.y;

        setPosition(currentPosition);

        onChangeElement({
          ...draggingElement,
          position,
        });
      } else if (resizingElement) {
        const scale = { ...resizingElement.scale };

        scale.x +=
          (2 * (currentPosition.x - lastPosition.x)) / editingElementSize.x;
        scale.y +=
          (2 * (currentPosition.y - lastPosition.y)) / editingElementSize.y;

        setPosition(currentPosition);

        onChangeElement({
          ...resizingElement,
          scale,
        });
      }
    },
    [draggingElement, onChangeElement, resizingElement],
  );

  const stopDrag = React.useCallback(() => {
    setDraggingElement(null);
    setResizingElement(null);
  }, []);

  return (
    <div
      className={cn(className, 'screenWrapper')}
      onMouseUpCapture={() =>
        !draggingElement && !resizingElement && onScreenClick()
      }
    >
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
            onContextMenuCapture={event => startEdit(event, element)}
            onMouseDownCapture={event => startEdit(event, element)}
            onWheel={event => rotateElement(event, element)}
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
