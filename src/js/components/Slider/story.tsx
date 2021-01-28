import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Slider from './';

const items = [1, 2, 3, 4, 5].map(item => <div>{item}</div>);

storiesOf('Slider', module)
  .add(
    'Default',
    () => <Slider items={items} />,
    { info: { inline: true } },
  );
