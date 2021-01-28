import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { isClient } from '../../helpers';
import { mainPagesPath } from '../../pages/main';

class Cookies extends React.Component {
  state = {
    isOpen: isClient && !localStorage.getItem('showCookies'),
  };

  clickHandler = () => {
    this.setState({ isOpen: false });
    localStorage.setItem('showCookies', 'false');
  }

  render() {
    return this.state.isOpen && (
      <div className='cookies'>
        <div className='cookies__text'>
          <div className='cookies__text-wrapper'>
            Мы используем cookie, ознакомьтесь с нашей&nbsp;
            <Link className='cookies__link' to={mainPagesPath.policy}>
              политикой конфиденциальности.
            </Link>
          </div>
        </div>
        <Button text='OK' className='cookies__button' onClick={this.clickHandler} />
      </div>
    );
  }
}

export default Cookies;
