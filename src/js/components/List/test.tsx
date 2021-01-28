import * as React from 'react';
import { render, cleanup } from 'react-testing-library';
import List from './';
import CheckBox from '../CheckBox';

const items = ['String item', <CheckBox name='check' labelOff='JSX item' />];

afterEach(cleanup);

it('List', () => {
  const { getByText, getByLabelText } = render(
    <List header='Header' items={items} />,
  );

  expect(getByText(/Header/i)).toBeTruthy();
  expect(getByText(/String item/i)).toBeTruthy();
  expect(getByLabelText(/JSX item/i)).toBeTruthy();
});
