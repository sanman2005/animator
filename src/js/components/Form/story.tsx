import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Form from './';
import Input from '../Input';

storiesOf('Form', module)
  .add(
    'Simple',
    () => (
      <Form
        title='Form title'
        sendText='Send form'
        sendingText='Sending...'
        failText='Send error'
        successText='Successful'
        fields={{ text: <Input /> }} />
      ),
    { info: { inline: true } },
  );
