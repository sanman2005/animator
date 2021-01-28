import * as React from 'react';
import { RouteProps, Switch } from 'react-router-dom';
import cn from 'classnames';

import { TPageRouteProps } from './PageRoute';
import * as Effects from './Effects';

type TPageProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  theme?: string;
};

type TPageManagerProps = {
  children: React.ReactElement<TPageRouteProps & RouteProps>
    | React.ReactElement<TPageRouteProps & RouteProps>[];
  className?: string;
  isLast?: boolean;
};

type TPageManagerState = {
  changing: boolean;
  isLast: boolean;
  style: any;
  theme: string;
};

export const PAGE = ({ className, theme, ...rest }: TPageProps) => (
  <div
    className={cn('page', className, { [`page--theme-${theme}`]: theme })}
    {...rest} />
);

export class PageManager extends React.PureComponent<TPageManagerProps> {
  static isChanging = () => PageManager.prevPage.changing;

  private static prevPage = {
    changing: false,
    content: '',
    effect: 'right',
    pageHeight: 0,
    path: '',
    pathPrev: '',
    theme: '',
  };

  state: TPageManagerState = {
    changing: false,
    isLast: false,
    style: {
      wrapper: {},
      page: {},
      pagePrev: {},
    },
    theme: '',
  };

  childrenReady: React.ReactNode[] = null;
  changeTimeoutId: NodeJS.Timeout = null;

  getEffect(pathNext: string, theme: string): Effects.TEffect {
    const { effect, pathPrev, theme: themePrev } = PageManager.prevPage;

    if (theme !== themePrev) {
      return 'appear';
    }

    if (pathPrev === pathNext) {
      return Effects.inverse[effect as string];
    }

    return 'right';
  }

  onChildActive = (content: HTMLDivElement, path: string, theme: string) => {
    if (path === PageManager.prevPage.path) {
      return;
    }

    const effect = this.getEffect(path, theme);

    this.setState({ isLast: true, theme });

    if (!PageManager.prevPage.content) {
      PageManager.prevPage.pathPrev = PageManager.prevPage.path = path;
      return;
    }

    PageManager.prevPage = {
      ...PageManager.prevPage,
      effect,
      path,
      pathPrev: PageManager.prevPage.path,
      changing: true,
    };

    this.startChange(effect, content.getBoundingClientRect().height);
  }

  onChildDeactive = (content: HTMLDivElement, theme: string) => {
    PageManager.prevPage.content = content.innerHTML;
    PageManager.prevPage.pageHeight = content.getBoundingClientRect().height;
    PageManager.prevPage.theme = theme;

    this.setState({ isLast: false });
  }

  get children() {
    if (!this.childrenReady) {
      const { children, isLast } = this.props;

      this.childrenReady = React.Children.map(
        children,
        (child: React.ReactElement<TPageRouteProps & RouteProps>) =>
          React.cloneElement(child, {
            ...child.props,
            isLast: child.props.isLast || isLast,
            onActive: this.onChildActive,
            onDeactive: this.onChildDeactive,
          }),
      );
    }

    return this.childrenReady;
  }

  componentWillUnmount() {
    if (this.changeTimeoutId) {
      clearTimeout(this.changeTimeoutId);
    }
  }

  startChange(effect: Effects.TEffect, pageHeight: number) {
    const styles = Effects.getStyles(
      effect,
      pageHeight,
      PageManager.prevPage.pageHeight,
    );
    const stateStart = { changing: true, style: styles.begin };
    const stateMove = { style: styles.end };
    const stateEnd = { changing: false, style: {} };

    const endMove = () => {
      PageManager.prevPage.changing = false;
      this.setState(stateEnd);
    };
    const startMove = () => this.setState(
      stateMove,
      () => {
        this.changeTimeoutId = setTimeout(endMove, Effects.timeChangeSec * 1000);
      },
    );

    this.setState(stateStart, () => setTimeout(startMove, 0));
  }

  render() {
    const { className } = this.props;
    const { changing, isLast, style, theme } = this.state;
    const { content: contentPrev, theme: themePrev } = PageManager.prevPage;
    const isSameTheme = themePrev === theme;

    return (
      <div
        className={cn(className, 'page-manager', 'page', {
          [`page--theme-${theme}`]: theme && isSameTheme,
          'page--last': isLast,
        })}>
        <div className='page-wrapper' style={style.wrapper}>
          {changing && (
            <PAGE
              className='page page--prev'
              theme={isSameTheme ? '' : themePrev}
              style={style.pagePrev}
              dangerouslySetInnerHTML={{ __html: contentPrev }} />
          )}
          <PAGE
            className='page page--current'
            theme={isSameTheme ? '' : theme}
            style={style.page}>
            <Switch>
              {this.children}
            </Switch>
          </PAGE>
        </div>
      </div>
    );
  }
}
