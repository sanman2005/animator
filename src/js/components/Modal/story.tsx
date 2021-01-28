import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Modal from './';

storiesOf('Modal', module)
  .add(
    'Default',
    () => <Modal><div>Content</div></Modal>,
    { info: { inline: true } },
  );
