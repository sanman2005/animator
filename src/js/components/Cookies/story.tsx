import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Cookies from './';

storiesOf('Cookies', module)
  .add(
    'Default',
    () => <Cookies />,
    { info: { inline: true } },
  );
