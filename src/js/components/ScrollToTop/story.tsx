import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ScrollToTop from './';

storiesOf('ScrollToTop', module)
  .add(
    'Default',
    () => <ScrollToTop />,
    { info: { inline: true } },
  );
