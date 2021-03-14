import React from 'react';
import cn from 'classnames';

import { getMousePosition, vectorsMinus } from 'js/helpers';

import { IElement, ISceneElement, IVector } from 'js/types';

interface IScreenProps {
  activeElementId?: string;
  animationTime: number;
  className?: string;
  elements: ISceneElement[];
  getRef?: (ref: HTMLElement) => void;
  onChangeElement?: (element: ISceneElement) => void;
  onScreenClick?: () => void;
  screen?: IElement;
}

interface IScreenState {
  draggingElement?: ISceneElement;
  editingElementSize?: IVector;
  resizingElement?: ISceneElement;
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

  rotateElement = (event: React.WheelEvent, element: ISceneElement) => {
    const angle = 5 * (event.deltaY < 0 ? 1 : -1);
    const rotation = (element.rotation + angle) % 360;

    this.props.onChangeElement({ ...element, rotation });
  };

  setMousePosition = (position: IVector) => (this.lastMousePosition = position);

  startEdit = (
    event: React.MouseEvent<HTMLDivElement>,
    element: ISceneElement,
  ) => {
    const { offsetHeight, offsetWidth } = event.currentTarget;
    const isRightClick = !!event.button;
    const editingElementSize = { x: offsetWidth, y: offsetHeight };

    if (isRightClick) {
      if (event.type === 'contextmenu') return;

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

  renderElement = (element: ISceneElement) => {
    const { activeElementId, animationTime } = this.props;
    const isEffect = element.repeatX !== 1 || element.repeatY !== 1;

    return (
      <div
        className={cn('screenElement', {
          'screenElement--active': activeElementId === element.id,
          'screenElement--effect': isEffect,
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
        <div
          className='screenElement__image'
          style={{
            animationDuration: `${isEffect ? 1 / element.animationSpeed : 0}s`,
            backgroundImage: `url(${element.idTemplate})`,
            backgroundRepeat: isEffect ? 'repeat' : 'no-repeat',
            backgroundSize: isEffect
              ? `${100 / element.repeatX}% ${100 / element.repeatY}%`
              : 'contain',
          }}
        />
      </div>
    );
  };

  render() {
    const {
      animationTime,
      children,
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
        {children || (
          <div
            className='screen'
            onMouseMoveCapture={this.onMouseMove}
            onMouseUpCapture={this.stopDrag}
            style={screenStyle}
          >
            {elements.map(this.renderElement)}
          </div>
        )}
      </div>
    );
  }
}
