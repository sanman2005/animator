import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './';

storiesOf('NotFound', module)
  .add(
    'Default',
    () => (
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    ),
    { info: { inline: true } },
  );
