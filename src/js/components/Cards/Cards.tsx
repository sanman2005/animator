import * as React from 'react';
import cn from 'classnames';

import Slider from '../Slider';

export interface ICardsProps {
  activeIndex?: number;
  className?: string;
  items: React.ReactNode[];
  loop?: boolean;
  onChange?: (index: number) => void;
  nextCardOffset?: number;
  speed?: number;
}

export default class Cards extends React.PureComponent<ICardsProps> {
  static defaultProps = {
    activeIndex: 0,
    nextCardOffset: 20,
    speed: 500,
  };

  state = {
    animating: false,
    activeIndex: this.props.activeIndex,
    nextIndex: 1,
    sliderIndex: this.props.activeIndex,
  };

  slider: HTMLDivElement;
  nextCard = React.createRef<HTMLDivElement>();
  animationFrame: number = null;

  componentDidMount() {
    cancelAnimationFrame(this.animationFrame);
    this.showCard(this.state.activeIndex);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationFrame);
  }

  showCard(index: number, card?: Element) {
    const showClass = 'cards__show';

    if (!card) {
      const shownCard = this.slider.querySelector(`.${showClass}`);

      if (shownCard) {
        shownCard.classList.remove(showClass);
      }
    }

    const cardToShow = card || this.slider.querySelector(`[data-index='${index}']`);

    if (cardToShow) {
      cardToShow.classList.add(showClass);
    }

    return cardToShow;
  }

  onSliderInit = (slider: HTMLDivElement) =>
    (this.slider = slider.querySelector('.slick-track'))

  onSwipe = () => this.startAnimate(true);

  onBeforeChange = (currentIndex: number, nextIndex: number) => {
    if (!this.state.animating) {
      this.setState({ sliderIndex: nextIndex }, this.startAnimate);
    } else {
      this.startAnimate();
    }
  }

  onChange = (sliderIndex: number) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(sliderIndex);
    }

    this.setState({ sliderIndex });
  }

  startAnimate = (checkTransform = false) => {
    if (this.state.animating) {
      return;
    }

    this.setState({ animating: true });
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = window.requestAnimationFrame(time =>
      this.animate(time, time, checkTransform),
    );
  }

  animate = (
    timeStart: number,
    time: number,
    checkTransform = false,
    currentOffset = 0,
    currentCard?: Element,
  ) => {
    const { activeIndex, sliderIndex } = this.state;
    const { items, loop, nextCardOffset, speed } = this.props;
    let offset = currentOffset;
    let offsetTarget = nextCardOffset;
    let diff = currentOffset - offsetTarget;

    currentCard = this.showCard(activeIndex, currentCard);

    if (checkTransform) {
      const { width, transform } = this.slider.style;
      const itemWidth =
        +width.replace('px', '') / this.slider.childElementCount;

      currentOffset = +transform.replace(/^.+\((-?\d+?)px.+$/, '$1');
      offsetTarget = ((loop ? -1 : 0) - sliderIndex) * itemWidth;
      diff = currentOffset - offsetTarget;
      offset = Math.abs((nextCardOffset * diff) / itemWidth);
    } else if (time !== timeStart) {
      const stepsCount = speed / (time - timeStart);
      const step = offsetTarget / stepsCount;

      offset += step;

      if (Math.abs(offsetTarget - offset) < step) {
        offset = offsetTarget;
      }

      if (sliderIndex < activeIndex) {
        diff = -diff;
      }

      const isLoopCase =
        (!activeIndex && sliderIndex === items.length - 1) ||
        (!sliderIndex && activeIndex === items.length - 1);

      if (isLoopCase) {
        diff = -diff;
      }
    }

    const nextIndex = this.getNextIndex(diff <= 0);

    if (nextIndex !== this.state.nextIndex) {
      this.setState({ nextIndex });
    }

    if (this.nextCard.current) {
      this.nextCard.current.style.transform = `translate3d(${-offset}px, ${offset}px, 0)`;
    }

    if (currentOffset !== offsetTarget || !this.nextCard.current) {
      window.requestAnimationFrame(t =>
        this.animate(time, t, checkTransform, offset, currentCard),
      );
    } else {
      this.setState({ activeIndex: sliderIndex, animating: false, nextIndex });
      this.nextCard.current.style.transform = `translate3d(0, 0, 0)`;
      this.showCard(sliderIndex);
    }
  }

  getNextIndex(up: boolean) {
    const { items, loop } = this.props;
    const { activeIndex } = this.state;
    const next = activeIndex + (up ? 1 : -1);

    return loop && next >= items.length
      ? 0
      : loop && next < 0
      ? items.length - 1
      : next;
  }

  render() {
    const { className, items, loop, nextCardOffset, speed } = this.props;
    const { nextIndex } = this.state;
    const offset = `${nextCardOffset}px`;
    const cardBackStyle = {
      left: offset,
      bottom: offset,
    };

    return (
      <div
        className={cn(className, 'cards')}
        style={{
          paddingRight: offset,
          paddingTop: offset,
        }}
      >
        <Slider
          items={items}
          loop={loop}
          speed={speed}
          getRef={this.onSliderInit}
          onBeforeChange={this.onBeforeChange}
          onChange={this.onChange}
          onSwipe={this.onSwipe}
        />
        {loop && (
          <div className='cards__back' style={cardBackStyle}>
            {items[0]}
          </div>
        )}
        {items[nextIndex] && (
          <div className='cards__next' style={cardBackStyle} ref={this.nextCard}>
            {items[nextIndex]}
          </div>
        )}
      </div>
    );
  }
}
