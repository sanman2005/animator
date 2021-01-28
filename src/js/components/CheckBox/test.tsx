import * as React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import CheckBox from './';

afterEach(cleanup);

it('CheckBox changes the text after click', () => {
  const { queryByLabelText, getByLabelText } = render(
    <CheckBox name='test' labelOn='On' labelOff='Off' />,
  );

  expect(queryByLabelText(/off/i)).toBeTruthy();
  fireEvent.click(getByLabelText(/off/i));
  expect(queryByLabelText(/on/i)).toBeTruthy();
});
