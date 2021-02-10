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
  onChangeItemIndex?: (item: IToolboxItem, index: number) => void;
  position: 'left' | 'right' | 'top' | 'bottom';
  withScroll?: boolean;
}

interface IToolboxState {
  draggingItem: IToolboxItem | null;
  itemHalfSize: number;
  offset: Vector;
  startMousePosition: Vector;
}

export class Toolbox extends React.PureComponent<IToolboxProps, IToolboxState> {
  state: IToolboxState = {
    draggingItem: null,
    itemHalfSize: 0,
    offset: { x: 0, y: 0 },
    startMousePosition: { x: 0, y: 0 },
  };

  isVertical = ['left', 'right'].includes(this.props.position);

  startDrag = (event: React.MouseEvent<HTMLDivElement>, item: IToolboxItem) => {
    const { offsetHeight, offsetWidth } = event.currentTarget;
    const itemHalfSize = (this.isVertical ? offsetHeight : offsetWidth) * 0.5;

    this.setState({
      draggingItem: item,
      itemHalfSize,
      offset: { x: 0, y: 0 },
      startMousePosition: getMousePosition(event),
    });
  };

  dragging = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!this.state.draggingItem) return;

    const { items, onChangeItemIndex } = this.props;
    const { draggingItem, itemHalfSize, startMousePosition } = this.state;
    const mousePosition = getMousePosition(event);
    const offset = {
      x: mousePosition.x - startMousePosition.x,
      y: mousePosition.y - startMousePosition.y,
    };
    const { isVertical } = this;
    const needReplace =
      Math.abs(isVertical ? offset.y : offset.x) > itemHalfSize;

    if (needReplace) {
      const newIndex =
        items.indexOf(draggingItem) +
        Math.sign(isVertical ? offset.y : offset.x);

      if (newIndex >= 0 && newIndex < items.length) {
        onChangeItemIndex(draggingItem, newIndex);
      }
    }

    this.setState({ offset });
  };

  stopDragging = () => this.setState({ draggingItem: null });

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

    return (
      <div
        className={cn(className, 'toolbox', `toolbox--${position}`, {
          'toolbox--column': ['left', 'right'].includes(position),
          'toolbox--row': ['top', 'bottom'].includes(position),
          'toolbox--with-scroll': withScroll,
        })}
        onMouseMoveCapture={this.dragging}
        onMouseUpCapture={this.stopDragging}
      >
        {items?.map(item => (
          <div
            className={cn('toolbox__item', {
              'toolbox__item--active': activeItemId === item.id,
            })}
            key={item.id}
            onMouseDownCapture={
              onChangeItemIndex ? event => this.startDrag(event, item) : null
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
