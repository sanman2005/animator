import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

export interface IWithPageProps {
  id?: string;
  url: string;
}

type TComponent = (props: IWithPageProps) => JSX.Element;

// tslint:disable:variable-name
export const withPage = (COMPONENT: TComponent) =>
  withRouter((props: RouteComponentProps<IWithPageProps>) => {
    const pageProps = {
      url: props.location.pathname,
      ...(props.match && props.match.params || {}),
    };

    return <COMPONENT {...props} {...pageProps} />;
  });
