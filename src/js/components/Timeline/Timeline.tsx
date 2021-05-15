import React from 'react';
import cn from 'classnames';

import Button from '../Button';

import Icons from '../icons';

import { ISceneElement, TFrame } from 'types';

interface ITimelineProps {
  activeElement?: ISceneElement;
  activeFrameIndex: number;
  className?: string;
  frames: TFrame[];
  onFrameDoubleClick?: (index: number) => void;
  onFrameClick?: (index: number) => void;
  onFrameRightClick?: (index: number) => void;
  onPlay: () => void;
  onRecord: () => void;
  onSettings: () => void;
  seconds: number;
}

export const Timeline: React.FC<ITimelineProps> = React.memo(
  ({
    activeElement,
    activeFrameIndex,
    className,
    frames,
    onFrameDoubleClick,
    onFrameClick,
    onFrameRightClick,
    onPlay,
    onRecord,
    onSettings,
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
                'timeline__frame--highlighted': activeElement
                  ? frame[activeElement.id]
                  : Object.values(frame).length,
                'timeline__frame--disabled':
                  activeElement?.lastFrameIndex &&
                  index >= activeElement.lastFrameIndex,
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
        icon={<Icons.settings />}
        onClick={onSettings}
        shape='circle'
        type='icon-main'
        shadow
      />

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
  ),
);
