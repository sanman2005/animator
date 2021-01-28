import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Container, Row, Column } from './';

storiesOf('Grid', module)
  .add(
    'Default',
    () => (
      <Container>
        Container
        <Row>
          <Column xs={6}>Column 6 / 12</Column>
          <Column xs={3}>Column 3 / 12</Column>
          <Column xs={2}>Column 2 / 12</Column>
          <Column xs={1}>1 / 12</Column>
        </Row>
      </Container>
    ),
    { info: { inline: true } },
  );
