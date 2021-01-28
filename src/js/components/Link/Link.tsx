import * as React from 'react';
import { NavLink } from 'react-router-dom';
import cn from 'classnames';

type TLinkProps = {
  children?: React.ReactNode;
  className?: string;
  exact?: boolean;
  text?: React.ReactNode;
  to: string;
};

export default ({ children, className, exact, text, to }: TLinkProps) => (
  <NavLink
    className={cn(className, 'link')}
    activeClassName='link--active'
    to={to}
    exact={exact}
  >
    {children || text}
  </NavLink>
);
