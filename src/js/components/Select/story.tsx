import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Select from './';
import { Reasons } from '../Validation';

const selectItems = [
  { key: '1', text: 'Option 1' },
  { key: '2', text: 'Option 2' },
  { key: '3', text: 'Option 3' },
];

storiesOf('Select', module)
  .add(
    'Simple',
    () => <Select name='select' label='Choose option' items={selectItems} />,
    { info: { inline: true } },
  )
  .add(
    'With validation',
    () => <Select
      name='select'
      label='Select not empty'
      required={true}
      validationTexts={{ [Reasons.required]: 'Choise is empty!' }}
      items={selectItems} />,
    { info: { inline: true } },
  )
  .add(
    'Multiselect with validation',
    () => <Select
      name='select'
      label='Multiselect'
      multi={true}
      required={true}
      validationTexts={{ [Reasons.required]: 'Choise is empty!' }}
      items={selectItems} />,
    { info: { inline: true } },
  );
