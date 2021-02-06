import * as React from 'react';
import cn from 'classnames';

import { IScreenElement } from '../Screen';

export type TFrame = { [key: string]: IScreenElement };

interface ITimelineProps {
  activeElementId: string;
  activeFrameIndex: number;
  className?: string;
  frames: TFrame[];
  onFrameClick?: (index: number) => void;
  onFrameRightClick?: (index: number) => void;
  seconds: number;
}

export class Timeline extends React.PureComponent<ITimelineProps> {
  state = {};

  render() {
    const {
      activeElementId,
      activeFrameIndex,
      className,
      frames,
      onFrameClick,
      onFrameRightClick,
      seconds,
    } = this.props;

    return (
      <div className={cn(className, 'timelineWrapper')}>
        <div className='timeline'>
          {Array.from(Array(seconds)).map((empty, time) => (
            <div
              className='timeline__mark'
              key={time}
              style={{ left: `${(100 * time) / seconds}%` }}
            >
              {time} сек
            </div>
          ))}
          {frames.map((frame, index) => (
            <div
              className={cn('timeline__frame', {
                'timeline__frame--active': activeFrameIndex === index,
                'timeline__frame--highlighted': activeElementId
                  ? frame[activeElementId]
                  : Object.values(frame).length,
              })}
              key={index}
              onClick={() => onFrameClick(index)}
              onContextMenu={event => {
                event.preventDefault();
                onFrameRightClick(index);
              }}
            />
          ))}
        </div>
      </div>
    );
  }
}
