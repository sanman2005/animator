import * as React from 'react';
import { storiesOf } from '@storybook/react';
import List from './';
import CheckBox from '../CheckBox';

const items = ['String item', <CheckBox name='check' labelOff='JSX item' />];

storiesOf('List', module)
  .add(
    'Default',
    () => <List header='List header' items={items} />,
    { info: { inline: true } },
  ).add(
    'Empty',
    () => <List header='List header' items={[]} />,
    { info: { inline: true } },
  );
