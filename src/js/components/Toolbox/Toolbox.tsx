import * as React from 'react';
import cn from 'classnames';

import { getMousePosition } from 'js/helpers';

import '../../types';

export interface IToolboxItem {
  id: string;
  content: React.ReactNode;
}

interface IToolboxProps {
  activeItemId?: string;
  children?: React.ReactNode;
  className?: string;
  draggable?: boolean;
  items?: IToolboxItem[];
  position: 'left' | 'right' | 'top' | 'bottom';
  withScroll?: boolean;
}

export class Toolbox extends React.PureComponent<IToolboxProps> {
  state = {
    draggingItem: null,
    itemSize: null,
    lastMousePosition: null,
  };

  isVertical = ['left', 'right'].includes(this.props.position);

  startDrag = (event: React.MouseEvent<HTMLDivElement>, item: IToolboxItem) => {
    const { position } = this.props;
    const { offsetHeight, offsetWidth } = event.currentTarget;
    const itemSize = this.isVertical ? offsetHeight : offsetWidth;

    this.setState({
      draggingItem: item,
      itemSize,
      lastMousePosition: getMousePosition(event),
    });
  };

  dragging = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!this.state.draggingItem) return;

    const mousePosition = getMousePosition(event);
    const { isVertical } = this;

    this.setState({
      lastMousePosition: mousePosition,
    });
  };

  stopDragging = () => this.setState({ draggingItem: null });

  render() {
    const {
      activeItemId,
      children,
      className,
      draggable,
      items,
      position,
      withScroll,
    } = this.props;

    return (
      <div
        className={cn(className, 'toolbox', `toolbox--${position}`, {
          'toolbox--column': ['left', 'right'].includes(position),
          'toolbox--row': ['top', 'bottom'].includes(position),
          'toolbox--with-scroll': withScroll,
        })}
        onMouseMove={this.dragging}
        onMouseUp={this.stopDragging}
      >
        {items?.map(item => (
          <div
            className={cn('toolbox__item', {
              'toolbox__item--active': activeItemId === item.id,
            })}
            key={item.id}
            onMouseDownCapture={
              draggable ? event => this.startDrag(event, item) : null
            }
          >
            {item.content}
          </div>
        ))}

        {children}
      </div>
    );
  }
}
