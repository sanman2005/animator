import * as React from 'react';

import { TPageRouteProps } from './PageRoute';

export class PageContent extends React.PureComponent<TPageRouteProps> {
  ref = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { isLast, onActive, path, theme } = this.props;

    if (onActive && isLast) {
      onActive(this.ref.current, path, theme);
    }
  }

  componentWillUnmount() {
    const { isLast, onDeactive, theme } = this.props;

    if (onDeactive && isLast) {
      onDeactive(this.ref.current, theme);
    }
  }

  render() {
    return (
      <div className='page-content' ref={this.ref}>
        {this.props.children}
      </div>
    );
  }
}
