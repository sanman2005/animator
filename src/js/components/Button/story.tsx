import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from './';

storiesOf('Button', module)
  .add(
    'Simple',
    () => <Button text='Simple button' onClick={() => alert('Clicked')} />,
    { info: { inline: true } },
  );
