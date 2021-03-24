import React from 'react';
import cn from 'classnames';

import Button from '../Button';

import Icons from '../icons';

import { ISceneElement } from 'types';

export type TFrame = { [key: string]: ISceneElement };

interface ITimelineProps {
  activeElementId: string;
  activeFrameIndex: number;
  className?: string;
  frames: TFrame[];
  onFrameDoubleClick?: (index: number) => void;
  onFrameClick?: (index: number) => void;
  onFrameRightClick?: (index: number) => void;
  onPlay: () => void;
  onRecord: () => void;
  seconds: number;
}

export const Timeline: React.FC<ITimelineProps> = React.memo(({
  activeElementId,
  activeFrameIndex,
  className,
  frames,
  onFrameDoubleClick,
  onFrameClick,
  onFrameRightClick,
  onPlay,
  onRecord,
  seconds,
}) => (
  <>
    <div className={cn(className, 'timelineWrapper')}>
      <div className='timeline'>
        {[...Array(seconds)].map((empty, time) => (
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
            onDoubleClick={() => onFrameDoubleClick(index)}
            onClick={() => onFrameClick(index)}
            onContextMenu={event => {
              event.preventDefault();
              onFrameRightClick(index);
            }}
          />
        ))}
      </div>
    </div>

    <Button
      className='timelineButton'
      icon={<Icons.triangle />}
      onClick={onPlay}
      shape='circle'
      type='icon-main'
      shadow
    />

    <Button
      className='timelineButton'
      icon={<Icons.circle />}
      onClick={onRecord}
      shape='circle'
      type='icon-main'
      shadow
    />
  </>
));
