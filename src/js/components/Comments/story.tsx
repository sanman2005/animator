import * as React from 'react';
import { storiesOf } from '@storybook/react';
import LessonComments from './';

storiesOf('LessonComments', module)
  .add(
    'Default',
    () => <LessonComments />,
    { info: { inline: true } },
  );
