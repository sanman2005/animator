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
  onCanvasDraw?: (context: CanvasRenderingContext2D) => void;
  onChangeElement?: (element: IScreenElement) => void;
  onScreenClick?: () => void;
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
      screen,
    } = this.props;

    const { draggingElement, resizingElement } = this.state;

    const screenStyle = {
      transform: screen && getElementTransform(screen),
      transitionDuration: `${animationTime}s`,
    };

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

        <canvas
          height='100%'
          ref={ref => (this.canvas = ref)}
          style={screenStyle}
          width='100%'
        />
      </div>
    );
  }
}
