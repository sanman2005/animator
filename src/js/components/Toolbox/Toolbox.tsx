import * as React from 'react';
import cn from 'classnames';

import { getMousePosition } from 'js/helpers';

import 'js/types.d.ts';

export interface IToolboxItem {
  id: string;
  content: React.ReactNode;
}

interface IToolboxProps {
  activeItemId?: string;
  children?: React.ReactNode;
  className?: string;
  items?: IToolboxItem[];
  onChangeItemIndex?: (id: string, index: number) => void;
  position: 'left' | 'right' | 'top' | 'bottom';
  withScroll?: boolean;
}

interface IToolboxState {
  draggingItemId?: string;
  itemHalfSize: number;
  offset: IVector;
  startMousePosition: IVector;
}

export class Toolbox extends React.PureComponent<IToolboxProps, IToolboxState> {
  state: IToolboxState = {
    draggingItemId: null,
    itemHalfSize: 0,
    offset: { x: 0, y: 0 },
    startMousePosition: { x: 0, y: 0 },
  };

  isVertical = ['left', 'right'].includes(this.props.position);

  startDrag = (event: React.MouseEvent<HTMLDivElement>, item: IToolboxItem) => {
    const { offsetHeight, offsetWidth } = event.currentTarget;
    const itemHalfSize = (this.isVertical ? offsetHeight : offsetWidth) * 0.5;

    this.setState({
      draggingItemId: item.id,
      itemHalfSize,
      offset: { x: 0, y: 0 },
      startMousePosition: getMousePosition(event),
    });
  };

  dragging = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!this.state.draggingItemId) return;

    const { items, onChangeItemIndex } = this.props;
    const { draggingItemId, itemHalfSize, startMousePosition } = this.state;
    const mousePosition = getMousePosition(event);
    const { isVertical } = this;

    const offset = {
      x: isVertical ? 0 : mousePosition.x - startMousePosition.x,
      y: isVertical ? mousePosition.y - startMousePosition.y : 0,
    };
    let offsetValue = isVertical ? offset.y : offset.x;
    const needReplace = Math.abs(offsetValue) > itemHalfSize;

    if (needReplace) {
      const index = items.findIndex(item => item.id === draggingItemId);
      const sign = Math.sign(offsetValue);
      const newIndex = index + sign;

      if (newIndex >= 0 && newIndex < items.length) {
        onChangeItemIndex(draggingItemId, newIndex);
        offsetValue = -sign * itemHalfSize;

        this.setState({
          startMousePosition: {
            x: isVertical ? 0 : startMousePosition.x + itemHalfSize * 2 * sign,
            y: isVertical ? startMousePosition.y + itemHalfSize * 2 * sign : 0,
          },
          offset: {
            x: isVertical ? 0 : offsetValue,
            y: isVertical ? offsetValue : 0,
          },
        });

        return;
      }
    }

    this.setState({ offset });
  };

  stopDragging = () =>
    this.state.draggingItemId && this.setState({ draggingItemId: null });

  render() {
    const {
      activeItemId,
      children,
      className,
      items,
      onChangeItemIndex,
      position,
      withScroll,
    } = this.props;
    const { draggingItemId, offset } = this.state;

    return (
      <div
        className={cn(className, 'toolbox', `toolbox--${position}`, {
          'toolbox--column': ['left', 'right'].includes(position),
          'toolbox--row': ['top', 'bottom'].includes(position),
          'toolbox--with-scroll': withScroll,
        })}
        onMouseLeave={this.stopDragging}
      >
        {items?.map(item => (
          <div
            className={cn('toolbox__item', {
              'toolbox__item--active': activeItemId === item.id,
            })}
            key={item.id}
            onMouseDown={
              onChangeItemIndex ? event => this.startDrag(event, item) : null
            }
            onMouseMove={this.dragging}
            onMouseUp={this.stopDragging}
            style={
              draggingItemId === item.id
                ? { transform: `translate(${offset.x}px, ${offset.y}px)` }
                : null
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
