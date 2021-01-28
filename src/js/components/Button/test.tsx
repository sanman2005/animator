import * as React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import Button from './';

afterEach(cleanup);

it('Button click', () => {
  let clicked = false;
  const onClick = () => (clicked = true);
  const test = 'Test';
  const { getByText } = render(
    <Button onClick={onClick} text={test} />,
  );
  const button = getByText(test);

  expect(button).toBeTruthy();
  fireEvent.click(button);
  expect(clicked).toBeTruthy();
});
