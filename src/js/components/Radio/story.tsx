import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Radio from './';

storiesOf('Radio', module)
  .add(
    'Default',
    () => <Radio />,
    { info: { inline: true } },
  );
