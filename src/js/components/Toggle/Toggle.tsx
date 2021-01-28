import * as React from 'react';
import cn from 'classnames';
import * as Scroll from 'react-scroll';

interface IToggleState {
  isOpen: boolean;
}

interface IToggleProps {
  description?: string;
  isOpen?: boolean;
  isCompleted?: boolean;
  isLastClosed?: boolean;
  onClick?: () => void;
  needScroll?: boolean;
  showToggleButton?: boolean;
  title: string;
  onlyHeadOpen?: boolean;
  id?: string;
  type?: 'big' | 'small' | 'fake' | 'lesson' | 'mobile-lessons';
}

class Toggle extends React.Component<IToggleProps, IToggleState> {
  static defaultProps = {
    type: 'big',
  };

  timeoutId: NodeJS.Timeout = null;
  timeoutIdClosed: NodeJS.Timeout = null;
  myRef = React.createRef<HTMLDivElement>();

  state = {
    isOpen: this.props.type === 'fake' || this.props.isOpen,
  };

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.timeoutIdClosed) {
      clearTimeout(this.timeoutIdClosed);
    }
  }

  toggleClick = () => {
    const { onClick, isOpen, needScroll } = this.props;

    if (needScroll) {
      const scrollProps = {
        duration: 300,
        delay: 0,
        smooth: true,
        offset: -150,
      };
      const time = 600;

      if (!isOpen && !this.timeoutId) {
        this.timeoutId = setTimeout(() => {
          Scroll.scroller.scrollTo('toggle--opened', scrollProps);
          this.timeoutId = null;
        }, time);
      } else {
        this.timeoutIdClosed = setTimeout(() => {
          Scroll.scroller.scrollTo('toggle--last', scrollProps);
          this.timeoutIdClosed = null;
        }, time);
      }
    }

    if (onClick) {
      onClick();
    }
  }

  render() {
    const {
      id,
      children,
      type,
      title,
      description,
      showToggleButton,
      isCompleted,
      isOpen,
      isLastClosed,
      onlyHeadOpen,
    } = this.props;

    const toggleClass = cn('toggle', `toggle--${type}`, {
      'toggle--opened': isOpen,
      'toggle--completed': isCompleted,
      'toggle--last': !isOpen && isLastClosed,
    });

    const isFake = type === 'fake';
    const isSmall = type === 'small';
    const isMobile = type === 'mobile-lessons';

    return (
      <div
        id={id}
        className={toggleClass}
        onClick={isFake || isMobile || onlyHeadOpen ? null : this.toggleClick}>
        <div
          className='toggle__head'
          onClick={isMobile || onlyHeadOpen ? this.toggleClick : null}>
          {!isSmall && <div className='toggle__number' />}
          <div className='toggle__title'>{title}</div>
          {!isFake && <div className='toggle__icon' />}
        </div>
        {description && !isSmall && (
          <div
            className='toggle__description'
            dangerouslySetInnerHTML={{ __html: description }} />
        )}
        <div className='toggle__body'>{children}</div>
        {showToggleButton && isOpen
          && <div className='toggle__button' onClick={this.toggleClick}>Скрыть –</div>}
      </div>
    );
  }
}

export default Toggle;
