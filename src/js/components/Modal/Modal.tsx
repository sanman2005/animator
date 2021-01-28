import * as React from 'react';
import * as ModalReact from 'react-modal';
import cn from 'classnames';

import Icons from '../icons';
import { scrollEnable, scrollDisable } from 'js/helpers';
import Button from 'components/Button';

interface IModalProps {
  children: JSX.Element;
  onClose?: () => void;
  noPad?: boolean;
}

export default class Modal extends React.Component<IModalProps> {
  componentDidMount() {
    scrollDisable();
  }

  componentWillUnmount() {
    scrollEnable();
  }

  render() {
    const { children, onClose, noPad } = this.props;
    const style = {
      overlay: {
        zIndex: 100,
      },
      content: {
        padding: 0,
        borderRadius: 0,
        background: 'none',
        border: 'none',
        overflow: 'visible',
      },
    };

    return (
      <ModalReact isOpen style={style}>
        {onClose && (
          <Button
            className='modal-close'
            onClick={onClose}
            icon={<Icons.close />}
          />
        )}
        <div className={cn('modal-content', { 'modal-content--nopad': noPad })}>
          {children}
        </div>
      </ModalReact>
    );
  }
}
