import * as React from 'react';

export enum TControlKeys {
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowDown = 'ArrowDown',
  ArrowUp = 'ArrowUp',
  KeyA = 'KeyA',
  KeyD = 'KeyD',
  KeyS = 'KeyS',
  KeyW = 'KeyW',
  Space = 'Space',
}

interface IControlProps {
  blockAxis?: boolean;
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  touchTarget?: HTMLElement;
}

const TOUCH_MOVE_MIN_DISTANCE = 10;

type TEvent = TouchEvent & { clientX: number; clientY: number };

export default class Control extends React.Component<IControlProps> {
  blockX = false;
  blockY = false;
  touchX = 0;
  touchY = 0;
  touching = false;
  moving = false;

  onKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation();
    this.props.onKeyDown(event.code);
  }

  onKeyUp = (event: KeyboardEvent) => {
    event.stopPropagation();
    this.props.onKeyUp(event.code);
  }

  onTouchStart = (event: TEvent) => {
    const { touchTarget } = this.props;

    if (touchTarget && event.target !== touchTarget) {
      return;
    }

    const { clientX, clientY } = (event.touches && event.touches[0]) || event;

    this.touchX = clientX;
    this.touchY = clientY;
    this.touching = true;
  }

  onTouchMove = (event: TEvent) => {
    const { blockAxis, onKeyDown, touchTarget } = this.props;

    if (!this.touching || (touchTarget && event.target !== touchTarget)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { clientX, clientY } = (event.touches && event.touches[0]) || event;

    if (
      !this.blockX &&
      clientX &&
      Math.abs(clientX - this.touchX) >= TOUCH_MOVE_MIN_DISTANCE
    ) {
      onKeyDown(
        clientX < this.touchX
          ? TControlKeys.ArrowLeft
          : TControlKeys.ArrowRight,
      );
      this.touchX = clientX;
      this.moving = true;

      if (blockAxis) {
        this.blockY = true;
      }
    }

    if (
      !this.blockY &&
      clientY &&
      Math.abs(clientY - this.touchY) >= TOUCH_MOVE_MIN_DISTANCE
    ) {
      onKeyDown(
        clientY > this.touchY ? TControlKeys.ArrowDown : TControlKeys.ArrowUp,
      );
      this.touchY = clientY;
      this.moving = true;

      if (blockAxis) {
        this.blockX = true;
      }
    }
  }

  onTouchEnd = (event: TEvent) => {
    const { onKeyDown, onKeyUp, touchTarget } = this.props;

    if (!this.moving) {
      if (!touchTarget || event.target === touchTarget) {
        onKeyDown(TControlKeys.Space);
      }
    } else {
      onKeyUp(TControlKeys.ArrowDown);
    }

    this.moving = this.touching = false;
    this.blockX = this.blockY = false;
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('mousedown', this.onTouchStart);
    window.addEventListener('mousemove', this.onTouchMove);
    window.addEventListener('mouseup', this.onTouchEnd);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('mousedown', this.onTouchStart);
    window.removeEventListener('mousemove', this.onTouchMove);
    window.removeEventListener('mouseup', this.onTouchEnd);
  }

  render() {
    return '';
  }
}
