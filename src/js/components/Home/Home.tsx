import * as React from 'react';

import { Content } from 'components/Grid';
import { Screen } from 'components/Screen';
import { Toolbox } from 'components/Toolbox';

export default () => (
  <Content className='home' centerContent>
    <Screen elements={[]} />

    <Toolbox
      position='left'
      items={[
        { id: 1, content: 123 },
        { id: 2, content: 321 },
      ]}
    />

    <Toolbox
      position='right'
      items={[
        { id: 1, content: 123 },
        { id: 2, content: 321 },
      ]}
    />

    <Toolbox
      position='bottom'
      items={[
        { id: 1, content: 123 },
        { id: 2, content: 321 },
      ]}
    />
  </Content>
);
