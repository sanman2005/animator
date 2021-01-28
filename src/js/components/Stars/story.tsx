import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Stars from './';

storiesOf('Stars', module)
  .add(
    'Default',
    () => <Stars />,
    { info: { inline: true } },
  );
