import * as React from 'react';
import { storiesOf } from '@storybook/react';
import DateTime from './';

const styles = require('./DateTime.styl');

storiesOf('DateTime', module)
  .add(
    'Default',
    () => <DateTime />,
    { info: { inline: true } },
  );
