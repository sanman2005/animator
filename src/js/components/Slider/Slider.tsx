import * as React from 'react';
import cn from 'classnames';
import SliderSlick, { SwipeDirection } from 'react-slick';

import Button from '../Button';

import Icons from '../icons';

export interface ISliderProps {
  activeIndex?: number;
  className?: string;
  countLg?: number;
  countMd?: number;
  countSm?: number;
  countXs?: number;
  getRef?: (ref: HTMLDivElement) => void;
  items: React.ReactNode[];
  loop?: boolean;
  onBeforeChange?: (index: number, nextIndex: number) => void;
  onChange?: (index: number) => void;
  onSwipe?: (direction: SwipeDirection) => void;
  pagination?: boolean;
  speed?: number;
}

const Arrow = (props: any) => { // tslint:disable-line:variable-name
  const { className, onClick, isNext } = props;
  const arrowClass = cn(
    className,
    'slider__arrow',
    `slider__arrow--${isNext ? 'next' : 'prev'}`,
  );

  return (
    <Button className={arrowClass} onClick={onClick} shape='circle'>
      <Icons.triangle />
    </Button>
  );
};

const MIN_DRAG_VALUE = 15;

class Slider extends React.PureComponent<ISliderProps> {
  clickCoordX = 0;
  ref = React.createRef<HTMLDivElement>();

  static defaultProps = {
    activeIndex: 0,
    speed: 300,
  };

  componentDidMount() {
    window.addEventListener('touchstart', this.touchStart);
    window.addEventListener('touchmove', this.preventTouch, { passive: false });

    const slider = this.ref.current;
    const { getRef } = this.props;

    slider.addEventListener('click', this.preventClick, { passive: false });
    slider.addEventListener('mousedown', this.clickStart);

    if (getRef) {
      getRef(slider);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('touchstart', this.touchStart);
    window.removeEventListener('touchmove', this.preventTouch);
  }

  touchStart(event: TouchEvent) {
    this.clickCoordX = event.touches[0].clientX;
  }

  clickStart(event: MouseEvent) {
    this.clickCoordX = event.clientX;
  }

  preventClick(event: MouseEvent) {
    const moveOffset = Math.abs(event.clientX - this.clickCoordX);

    if (moveOffset > MIN_DRAG_VALUE) {
      event.preventDefault();
    }
  }

  preventTouch(event: TouchEvent) {
    const moveOffset = Math.abs(event.touches[0].clientX - this.clickCoordX);

    if (moveOffset > MIN_DRAG_VALUE) {
      event.preventDefault();
      return false;
    }
  }

  render() {
    const {
      activeIndex,
      className,
      countLg,
      countMd,
      countSm,
      countXs,
      items,
      loop,
      onBeforeChange,
      onChange,
      onSwipe,
      pagination,
      speed,
    } = this.props;
    const countDefault = countLg || 1;
    const countForMd = countMd || countDefault;
    const countForSm = countSm || countForMd;
    const countForXs = countXs || countForSm;

    const settings = {
      afterChange: onChange,
      beforeChange: onBeforeChange,
      dots: !!pagination,
      dotsClass: 'slider__pagination',
      infinite: !!loop,
      initialSlide: activeIndex,
      speed,
      swipe: true,
      prevArrow: <Arrow />,
      nextArrow: <Arrow isNext />,
      slidesToShow: countDefault,
      slidesToScroll: countDefault,
      swipeEvent: onSwipe,
      responsive: [
        {
          breakpoint: 1439,
          settings: {
            slidesToShow: countForMd,
            slidesToScroll: countForMd,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: countForSm,
            slidesToScroll: countForSm,
          },
        },
        {
          breakpoint: 413,
          settings: {
            slidesToShow: countForXs,
            slidesToScroll: countForXs,
          },
        },
      ],
    };

    return (
      <div className={cn(className, 'slider')} ref={this.ref}>
        <SliderSlick {...settings}>
          {items}
        </SliderSlick>
      </div>
    );
  }
}

export default Slider;
