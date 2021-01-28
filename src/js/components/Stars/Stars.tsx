import * as React from 'react';
import Icons from '../icons';
import cn from 'classnames';

interface IStarsProps {
  onClick?: (value: number) => void;
  value?: number;
}

interface IStarsState {
  isHover: boolean;
  currentRating: number;
  choosedRating: number;
}

class Stars extends React.Component<IStarsProps, IStarsState> {
  state = {
    isHover: false,
    currentRating: 0,
    choosedRating: this.props.value || 0,
  };

  handleStarHover = (index: number) => this.setState({
    currentRating: index + 1,
  })

  handleRatingHover = () => !this.props.value && this.setState({
    isHover: true,
  })

  handleRatingLeave = () => this.setState({
    isHover: false,
  })

  handleStarClick = (index: number) => {
    const { onClick, value } = this.props;

    if (value) {
      return;
    }

    const newValue = index + 1;

    this.setState({ choosedRating: newValue });

    if (onClick) {
      onClick(newValue);
    }
  }

  componentDidUpdate(prevProps: IStarsProps) {
    const { value } = this.props;

    if (value !== prevProps.value && value !== this.state.choosedRating) {
      this.setState({ choosedRating: value });
    }
  }

  renderStar = (index: number) => {
    const { choosedRating, currentRating } = this.state;

    const starClass = cn('star', {
      'star--hovered': currentRating > index,
      'star--choosed': choosedRating && choosedRating > index,
    });

    return (
      <div
        className={starClass}
        key={index}
        onMouseEnter={() => this.handleStarHover(index)}
        onClick={() => this.handleStarClick(index)}>
        <Icons.star />
        {this.renderToolTip(index)}
      </div>
    );
  }

  renderStars = () => [0, 1, 2, 3, 4].map(rating => this.renderStar(rating));

  renderToolTip = (index: number) => {
    const { currentRating, isHover } = this.state;
    const dictionary = [
      'скучно',
      'плохо',
      'неплохо',
      'отлично',
      'блестяще',
    ];
    const showTooltip = isHover && currentRating === index + 1;

    return showTooltip && <div className='tooltip'>{dictionary[index]}!</div>;
  }

  render() {
    const { isHover } = this.state;
    const wrapperClass = cn('stars-wrapper', {
      'stars--choosing': isHover,
    });

    return (
      <div
        onMouseEnter={this.handleRatingHover}
        onMouseLeave={this.handleRatingLeave}
        className={wrapperClass}>
        {this.renderStars()}
      </div>
    );
  }
}

export default Stars;
