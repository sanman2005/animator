import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Features from './';

storiesOf('Features', module)
  .add(
    'Default',
    () => <Features />,
    { info: { inline: true } },
  );
