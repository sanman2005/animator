import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Social from './';

storiesOf('Social', module)
  .add(
    'Default',
    () => <Social />,
    { info: { inline: true } },
  );
