import * as React from 'react';

const year = new Date().getFullYear();

export default () => (
  <footer className='footer'>
    <div className='footer__copyright'>
      ©
      <a className='link' href='mailto:sanman@mail.ru'>
        Sanman
      </a>
      {year}
    </div>
  </footer>
);
