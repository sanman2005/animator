import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ScrollLinks from './';

storiesOf('ScrollLinks', module)
  .add(
    'Preview',
    () => <ScrollLinks type='preview' />,
    { info: { inline: true } },
  ).add(
    'Class',
    () => <ScrollLinks type='class' />,
    { info: { inline: true } },
);
