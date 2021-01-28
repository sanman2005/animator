import * as React from 'react';
import { cleanup, render } from 'react-testing-library';
import Form from './';

afterEach(cleanup);

it('Form test', () => {
  const { queryAllByText } = render(
    <Form sendText='Send' fields={{}} />,
  );

  expect(queryAllByText(/Send/i)).toBeTruthy();
});
