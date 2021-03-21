import React from 'react';

import { ISpeech } from 'types';
import { ECorners } from 'js/constants';

export const Text: React.FC<ISpeech> = ({ corner, size, text }) => (
  <div
    className='text'
    style={{
      fontSize: `${size}px`,
      borderBottomLeftRadius: corner === ECorners.leftBottom && 0,
      borderBottomRightRadius: corner === ECorners.rightBottom && 0,
      borderTopLeftRadius: corner === ECorners.leftTop && 0,
      borderTopRightRadius: corner === ECorners.rightTop && 0,
    }}
  >
    {text}
  </div>
);
