import * as React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import Input from './';

afterEach(cleanup);

it('Input changes the value', () => {
  const onChangeHandler = jest.fn();
  const { getAllByValue } = render(
    <Input name='test' label='test' value='value1' onChange={onChangeHandler} />,
  );

  const input = getAllByValue(/value1/i)[0] as HTMLInputElement;

  expect(input).toBeTruthy();
  fireEvent.change(input, { target: { value: 'value2' } });

  expect(onChangeHandler).toBeCalledTimes(1);
});
