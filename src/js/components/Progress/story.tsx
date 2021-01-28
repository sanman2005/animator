import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Progress from './';

storiesOf('Progress', module)
  .add(
    'Default',
    () => <Progress value={50} />,
    { info: { inline: true } },
  );

