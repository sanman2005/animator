import * as React from 'react';
import { render, cleanup } from 'react-testing-library';
import { Container, Row, Column } from './';

afterEach(cleanup);

// tslint:disable:no-magic-numbers
it('Grid components render right', () => {
  const { getByText } = render(
    <Container>
      <Row>
        <Column lg={6} md={8} sm={12}>
          Test
        </Column>
      </Row>
    </Container>,
  );
  const { className } = getByText('Test');
  const classes = className.split(' ');

  expect(classes.indexOf('column--lg-6')).toBeGreaterThan(-1);
  expect(classes.indexOf('column--md-8')).toBeGreaterThan(-1);
  expect(classes.indexOf('column--sm-12')).toBeGreaterThan(-1);
});
