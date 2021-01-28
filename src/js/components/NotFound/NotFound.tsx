import * as React from 'react';

import Button from '../Button';
import { Container } from '../Grid';

import i18n from 'js/i18n';

export default () => (
  <Container className='page404' title={i18n`404`}>
    <Button text={i18n`homePage`} href='/' type='main2' />
  </Container>
);
