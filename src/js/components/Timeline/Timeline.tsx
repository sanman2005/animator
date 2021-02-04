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
    } = this.props;

    return (
      <div className={cn(className, 'timelineWrapper')}>
        <div className='timeline'>
          {frames.map((frame, index) => (
            <div
              className={cn('timeline__frame', {
                'timeline__frame--active': activeFrameIndex === index,
                'timeline__frame--highlighted': activeElementId
                  ? frame[activeElementId]
                  : Object.values(frame).length,
              })}
              onClick={() => onFrameClick(index)}
            />
          ))}
        </div>
      </div>
    );
  }
}
