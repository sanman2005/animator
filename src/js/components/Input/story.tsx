import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Input from './';
import { Reasons } from '../Validation';

storiesOf('Input', module)
  .add(
    'Text',
    () => <Input name='input' label='Input text' />,
    { info: { inline: true } },
  )
  .add(
    'Text with validation',
    () => <Input
      name='input'
      label='Input not empty text'
      required={true}
      validationTexts={{ [Reasons.required]: 'Text is empty!' }} />,
    { info: { inline: true } },
  )
  .add(
    'Number with validation',
    () => <Input
      name='input'
      label='Input number'
      pattern='^\d{1,}'
      required={true}
      validationTexts={{
        [Reasons.required]: 'Number is empty!',
        [Reasons.pattern]: 'Number must contain only digits!',
      }} />,
    { info: { inline: true } },
  );
