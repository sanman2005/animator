import * as React from 'react';
import cn from 'classnames';
import Media from 'react-media';
import { Content } from '../Grid';
import { isClient, media } from '../../helpers';

interface IScrollLinksProps {
  className?: string;
  type: 'preview' | 'class';
}

interface IScrollLinksState {
  activeIndex: number;
  hash: string;
}

interface ILinks {
  [key: string]: string;
}

class ScrollLinks extends React.Component<IScrollLinksProps, IScrollLinksState> {
  state = {
    activeIndex: 0,
    hash: '',
  };

  getInitialActiveItem = () => this.props.type === 'class' ? '#lessons' : '#annonce';

  componentDidMount() {
    this.setState({
      hash: this.getInitialActiveItem(),
    });

    if (isClient) {
      window.addEventListener('scroll', this.scrollHandler);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  scrollHandler = () => {
    const { hash } = this.state;

    const scrollTop = document.documentElement.scrollTop;
    const topOffset = window.innerHeight;

    const currentHash =
      scrollTop < topOffset
        ? this.getInitialActiveItem()
        : window.location.hash;

    if (hash !== currentHash) {
      this.setState({
        hash: currentHash,
      });
    }
  }

  handlerClick = (activeIndex: number) => this.setState({ activeIndex });

  renderLinks = () => {
    const { hash } = this.state;
    const { type } = this.props;
    const linksPreview: ILinks = {
      '#annonce': 'Анонс',
      '#teacher': 'О преподавателе',
      '#lessons': 'Все уроки',
    };
    const linksClass: ILinks = {
      '#lessons': 'Все Уроки',
      '#materials': 'Учебные материалы',
      '#questions': 'Вопросы преподавателю',
    };
    const links = type === 'class' ? linksClass : linksPreview;

    return Object.keys(links).map((link, index) => {
      const linkClass = cn('scroll-links__link link', {
        'scroll-links__link--active': link === hash,
      });

      return (
        <a
          href={link}
          key={index}
          className={linkClass}
          onClick={() => this.handlerClick(index)}
        >
          {links[link]}
        </a>
      );
    });
  }

  render() {
    const { className, type } = this.props;
    const wrapperClass = cn('scroll-links', {
      'scroll-links--preview': type === 'preview',
      [className]: className,
    });
    const links = <div className={wrapperClass}>{this.renderLinks()}</div>;
    const linksElement =
      type === 'class' ? (
        <Content className={className} wide>
          {links}
        </Content>
      ) : (
        links
      );

    return (
      <Media query={media.medium}>
        {matches => matches ? null : linksElement}
      </Media>
    );
  }
}

export default ScrollLinks;
