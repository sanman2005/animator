import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Video from './';

storiesOf('Video', module)
  .add(
    'Default',
    () => <Video url='288589686' />,
    { info: { inline: true } },
  );
