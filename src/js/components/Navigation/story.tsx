import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Navigation from './';

storiesOf('Navigation', module)
  .add(
    'Default',
    () => <Navigation />,
    { info: { inline: true } },
  );
