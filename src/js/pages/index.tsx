import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

import Layout from 'components/Layout';
import { PageManager, PageRoute } from 'components/PageManager';
import Page404 from 'components/NotFound';
import Home from './home';

import {
  getLang,
  addLangUpdateListener,
  removeLangUpdateListener,
} from '../i18n';

dayjs.extend(relativeTime);
dayjs.locale(getLang());

class Root extends React.Component<RouteComponentProps & any> {
  onLangUpdate = () => {
    dayjs.locale(getLang());
    this.forceUpdate();
  }

  componentDidMount() {
    addLangUpdateListener(this.onLangUpdate);
  }

  componentWillUnmount() {
    removeLangUpdateListener(this.onLangUpdate);
  }

  render() {
    return (
      <Layout key={getLang()}>
        <PageManager key={this.props.location.pathname} isLast>
          <PageRoute path='/' exact component={Home} theme='home' />
          <PageRoute component={Page404} theme='page404' />
        </PageManager>
      </Layout>
    );
  }
}

export default withRouter(Root);

