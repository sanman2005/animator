import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Loading from './';

storiesOf('Loading', module)
  .add(
    'Default',
    () => <Loading />,
    { info: { inline: true } },
  );
