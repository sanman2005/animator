import * as React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import Select from './';

afterEach(cleanup);

it('Input changes the value', () => {
  const onChangeHandler = jest.fn();
  const selectItems = [{ key: '1', text: '1' }];
  const { getAllByValue } = render(
    <Select name='test' label='test' value='value1' onChange={onChangeHandler} items={selectItems} />,
  );

  const input = getAllByValue(/value1/i)[0] as HTMLSelectElement;

  expect(input).toBeTruthy();
  fireEvent.change(input, { target: { value: 'value2' } });

  expect(onChangeHandler).toBeCalledTimes(1);
});
