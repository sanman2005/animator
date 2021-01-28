import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Page from './';

storiesOf('Page', module)
  .add(
    'Default',
    () => <Page><div>Content</div></Page>,
    { info: { inline: true } },
  );
