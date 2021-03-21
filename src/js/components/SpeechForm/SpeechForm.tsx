import React from 'react';

import Form from 'components/Form';
import { InputNumber, InputText } from 'components/Input';
import Modal from 'components/Modal';
import Select from 'components/Select';

import { ISpeech } from 'types';
import { ECorners } from 'js/constants';

interface ISpeechFormProps extends ISpeech {
  onClose: () => void;
  onSubmit: (result: { speech: ISpeech }) => void;
}

const CORNERS = Object.keys(ECorners).map(corner => ({
  key: corner,
  text: corner,
}));

export const SpeechForm: React.FC<ISpeechFormProps> = ({
  corner,
  onClose,
  onSubmit,
  size,
  text,
}) => (
  <Modal onClose={onClose}>
    <Form
      fields={{
        text: <InputText label='Текст' required value={text} />,
        corner: <Select items={CORNERS} label='Угол' required value={corner} />,
        size: <InputNumber label='Размер' required value={`${size}`} />,
      }}
      onSubmit={({ corner, size, text }) =>
        onSubmit({ speech: { corner, size: +size, text } })
      }
      sendText='OK'
      title='Настройка текста'
    />
  </Modal>
);
