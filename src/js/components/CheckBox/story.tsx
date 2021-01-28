import * as React from 'react';
import { storiesOf } from '@storybook/react';
import CheckBox from './';

storiesOf('CheckBox', module)
  .add(
    'Left check',
    () => <CheckBox name='check' labelOn='Checked' labelOff='Off' />,
    { info: { inline: true } },
  )
  .add(
    'Right check',
    () => <CheckBox name='check' labelOn='Checked' labelOff='Off' checkToBack={true} />,
    { info: { inline: true } },
  );
