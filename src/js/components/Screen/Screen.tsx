import * as React from 'react';
import cn from 'classnames';

import { getMousePosition } from 'js/helpers';

import 'js/types.d.ts';

export interface IElement {
  position: IVector;
  rotation: number;
  scale: IVector;
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
  animationTime: number;
  className?: string;
  elements: IScreenElement[];
  getRef?: (ref: HTMLElement) => void;
  onChangeElement?: (element: IScreenElement) => void;
  onScreenClick?: () => void;
  screen?: IElement;
}

const getElementTransform = (element: IElement) =>
  `translate(${element.position.x}%, ${element.position.y}%) ` +
  `rotateZ(${element.rotation}deg) ` +
  `scale(${element.scale.x}, ${element.scale.y}) `;

export const Screen: React.FC<IScreenProps> = ({
  activeElementId,
  animationTime,
  className,
  elements,
  getRef,
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
  const [lastPosition, setPosition] = React.useState<IVector>(null);
  const [editingElementSize, setEditingElementSize] = React.useState<IVector>(
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
      setPosition(getMousePosition(event));
    },
    [],
  );

  const onMouseMove = React.useCallback(
    event => {
      const currentPosition = getMousePosition(event);

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
        const isShift = event.shiftKey;
        const diff = {
          x: currentPosition.x - lastPosition.x,
          y: currentPosition.y - lastPosition.y,
        };
        const maxDiff = Math.max(diff.x, diff.y);

        scale.x += (2 * isShift ? maxDiff : diff.x) / editingElementSize.x;
        scale.y += (2 * isShift ? maxDiff : diff.y) / editingElementSize.y;

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
      onContextMenuCapture={event => event.preventDefault()}
      ref={getRef}
    >
      <div
        className='screen'
        onMouseMoveCapture={onMouseMove}
        onMouseUpCapture={stopDrag}
        style={{
          transform: screen && getElementTransform(screen),
          transitionDuration: `${animationTime}s`,
        }}
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
              height: `${element.height}%`,
              left: `calc(50% - ${element.width / 2}%)`,
              top: `calc(50% - ${element.height / 2}%)`,
              transform: getElementTransform(element),
              transitionDuration: `${animationTime}s`,
              width: `${element.width}%`,
            }}
          >
            {element.content}
          </div>
        ))}
      </div>
    </div>
  );
};
