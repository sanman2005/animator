import * as React from 'react';
import cn from 'classnames';
import { NavLink } from 'react-router-dom';

export type TButtonType =
  | 'main'
  | 'main2'
  | 'light'
  | 'red'
  | 'yellow'
  | 'icon-main';
export type TButtonShape = 'circle';

interface IButtonProps {
  autosize?: boolean;
  children?: React.ReactChild | React.ReactChild[];
  className?: string;
  disabled?: boolean;
  href?: string;
  icon?: JSX.Element;
  onClick?: (event: React.FormEvent) => void;
  shadow?: boolean;
  shape?: TButtonShape;
  text?: string | number;
  type?: TButtonType;
}

const button = (props: IButtonProps) => {
  const {
    autosize,
    children,
    className,
    disabled,
    href,
    icon,
    onClick,
    shadow,
    shape,
    text,
    type,
  } = props;
  const attributes = {
    disabled,
    onClick,
    className: cn(className, 'button', {
      [`button--${type}`]: type,
      [`button--${shape}`]: shape,
      'button--autosize': autosize,
      'button--icon': icon,
      'button--shadow': shadow || !type,
    }),
  };
  const content = (
    <>
      {icon}
      {children || text}
    </>
  );

  return href ? (
    <NavLink activeClassName='active' to={href} {...attributes}>
      {content}
    </NavLink>
  ) : children ? (
    <div {...attributes}>{content}</div>
  ) : (
    <button {...attributes}>{content}</button>
  );
};

export default button;
