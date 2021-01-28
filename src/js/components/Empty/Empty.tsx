import * as React from 'react';

export default ({ text = 'Список пуст' }: { text?: React.ReactNode }) =>
  <div className='empty'>{text}</div>;
