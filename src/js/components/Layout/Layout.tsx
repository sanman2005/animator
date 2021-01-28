import * as React from 'react';
import { Header, Footer } from './';

interface ILayoutProps {
  children: React.ReactNode;
}

export default (props: ILayoutProps) => {
  const { children } = props;

  return (
    <div className='layout'>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
