import * as React from 'react';
import cn from 'classnames';

import { getMousePosition, vectorsMinus, vectorsPlus } from 'js/helpers';

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
  onDrawCanvas?: (context: CanvasRenderingContext2D) => void;
  onChangeElement?: (element: IScreenElement) => void;
  onScreenClick?: () => void;
  record?: boolean;
  recordResolution?: IVector;
  screen?: IElement;
}

interface IScreenState {
  draggingElement: IScreenElement;
  editingElementSize: IVector;
  resizingElement: IScreenElement;
}

const getElementTransform = (element: IElement) =>
  `translate(${element.position.x}%, ${element.position.y}%) ` +
  `rotateZ(${element.rotation}deg) ` +
  `scale(${element.scale.x}, ${element.scale.y}) `;

export class Screen extends React.PureComponent<IScreenProps, IScreenState> {
  state: IScreenState = {
    draggingElement: null,
    editingElementSize: null,
    resizingElement: null,
  };
  lastMousePosition: IVector = { x: 0, y: 0 };
  canvas: HTMLCanvasElement = null;

  draw = () => {
    const { elements, onDrawCanvas } = this.props;
    const { canvas } = this;

    if (!canvas || !onDrawCanvas) return;

    const context = canvas.getContext('2d');
    let waitImagesCount = elements.length;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach(
      ({ height, idTemplate, rotation, position, scale, width }) => {
        const image = new Image();
        const koef = 0.01;
        const scaledWidth = canvas.width * width * koef * scale.x;
        const scaledHeight = canvas.height * height * koef * scale.y;
        const x = canvas.width * (0.5 + width * position.x * koef * koef);
        const y = canvas.height * (0.5 + height * position.y * koef * koef);
        const angle = (Math.PI / 180) * rotation;

        image.onload = () => {
          context.translate(x, y);
          context.rotate(angle);

          context.drawImage(
            image,
            -scaledWidth * 0.5,
            -scaledHeight * 0.5,
            scaledWidth,
            scaledHeight,
          );

          context.rotate(-angle);
          context.translate(-x, -y);

          waitImagesCount--;

          if (!waitImagesCount) onDrawCanvas(context);
        };

        image.src = idTemplate;
      },
    );
  };

  onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { onChangeElement } = this.props;
    const { draggingElement, editingElementSize, resizingElement } = this.state;
    const mousePosition = getMousePosition(event);
    const diff = vectorsMinus(mousePosition, this.lastMousePosition);

    if (draggingElement) {
      const position = { ...draggingElement.position };

      position.x += (100 * diff.x) / editingElementSize.x;
      position.y += (100 * diff.y) / editingElementSize.y;

      const newElement = { ...draggingElement, position };

      onChangeElement(newElement);
      this.setState({ draggingElement: newElement });
    }

    if (resizingElement) {
      const scale = { ...resizingElement.scale };
      const isShift = event.shiftKey;
      const isShiftX = Math.abs(diff.x) > Math.abs(diff.y);
      const koefXY = isShift && editingElementSize.x / editingElementSize.y;

      scale.x +=
        (2 * (isShift && !isShiftX ? diff.y * koefXY : diff.x)) /
        editingElementSize.x;

      scale.y +=
        (2 * (isShift && isShiftX ? diff.x / koefXY : diff.y)) /
        editingElementSize.y;

      const newElement = { ...resizingElement, scale };

      onChangeElement(newElement);
      this.setState({ resizingElement: newElement });
    }

    this.setMousePosition(mousePosition);
  };

  rotateElement = (event: React.WheelEvent, element: IScreenElement) => {
    const angle = 5 * (event.deltaY < 0 ? 1 : -1);
    const rotation = (element.rotation + angle) % 360;

    this.props.onChangeElement({ ...element, rotation });
  };

  setMousePosition = (position: IVector) => (this.lastMousePosition = position);

  startEdit = (
    event: React.MouseEvent<HTMLDivElement>,
    element: IScreenElement,
  ) => {
    const { offsetHeight, offsetWidth } = event.currentTarget;
    const isRightClick = !!event.button;
    const editingElementSize = { x: offsetWidth, y: offsetHeight };

    if (isRightClick) {
      event.stopPropagation();
      event.preventDefault();
      this.setState({ resizingElement: element, editingElementSize });
    } else {
      this.setState({ draggingElement: element, editingElementSize });
    }

    this.setMousePosition(getMousePosition(event));
  };

  stopDrag = () =>
    this.setState({ draggingElement: null, resizingElement: null });

  render() {
    const {
      activeElementId,
      animationTime,
      className,
      elements,
      getRef,
      onScreenClick,
      record,
      recordResolution,
      screen,
    } = this.props;

    const { draggingElement, resizingElement } = this.state;

    const screenStyle = {
      transform: screen && getElementTransform(screen),
      transitionDuration: `${animationTime}s`,
    };

    record && this.draw();

    return (
      <div
        className={cn(className, 'screenWrapper')}
        onMouseUpCapture={() =>
          !draggingElement && !resizingElement && onScreenClick()
        }
        onContextMenuCapture={event => event.preventDefault()}
        ref={getRef}
      >
        {record ? (
          <canvas
            className='screenCanvas'
            height={recordResolution?.y}
            ref={ref => (this.canvas = ref)}
            width={recordResolution?.x}
          />
        ) : (
          <div
            className='screen'
            onMouseMoveCapture={this.onMouseMove}
            onMouseUpCapture={this.stopDrag}
            style={screenStyle}
          >
            {elements.map(element => (
              <div
                className={cn('screenElement', {
                  'screenElement--active': activeElementId === element.id,
                })}
                key={element.id}
                onContextMenuCapture={event => this.startEdit(event, element)}
                onMouseDownCapture={event => this.startEdit(event, element)}
                onWheel={event => this.rotateElement(event, element)}
                style={{
                  height: `${element.height}%`,
                  left: `calc(${50 - element.width / 2}%)`,
                  top: `calc(${50 - element.height / 2}%)`,
                  transform: getElementTransform(element),
                  transitionDuration: `${animationTime}s`,
                  width: `${element.width}%`,
                }}
              >
                {element.content}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
