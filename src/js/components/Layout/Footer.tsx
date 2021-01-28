import * as React from 'react';

import { Container, Column, Row } from '../Grid';

const year = new Date().getFullYear();

export default () => (
  <footer className='footer'>
    <Container>
      <Row>
        <Column xs={6} className='footer__copyright'>
          ©
          <a className='link' href='mailto:sanman@mail.ru'>
            Sanman
          </a>
          {year}
        </Column>
      </Row>
    </Container>
  </footer>
);
