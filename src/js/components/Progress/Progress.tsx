import * as React from 'react';

interface IProgressBarProps {
  value: number;
}

export default (props: IProgressBarProps) => {
  const { value } = props;

  return (
    <div className='progress'>
      <div
        className='progress__filler'
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
