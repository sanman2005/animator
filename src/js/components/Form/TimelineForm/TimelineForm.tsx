import React from 'react';

import Form from 'components/Form';
import { InputNumber } from 'components/Input';
import Modal from 'components/Modal';

import { ITimeline } from 'types';

interface ITimelineFormProps extends ITimeline {
  onClose: () => void;
  onSubmit: (result: ITimeline) => void;
}

export const TimelineForm: React.FC<ITimelineFormProps> = React.memo(
  ({ framesCount, onClose, onSubmit, time }) => (
    <Modal onClose={onClose}>
      <Form
        fields={{
          framesCount: (
            <InputNumber
              label='Количество кадров'
              required
              value={`${framesCount}`}
            />
          ),
          time: (
            <InputNumber
              label='Длительность (сек)'
              required
              value={`${time}`}
            />
          ),
        }}
        onSubmit={({ framesCount, time }) =>
          framesCount > 0 &&
          time > 0 &&
          onSubmit({
            framesCount: +framesCount,
            time: +time,
          })
        }
        sendText='OK'
        title='Настройка временной ленты'
      />
    </Modal>
  ),
);
