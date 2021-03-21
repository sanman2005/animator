import React from 'react';

import Form from 'components/Form';
import { InputText } from 'components/Input';
import Modal from 'components/Modal';

import { ISpeech } from 'js/types';

interface ISpeechFormProps extends ISpeech {
  onClose: () => void;
  onSubmit: (result: ISpeech) => void;
}

export const SpeechForm: React.FC<ISpeechFormProps> = ({
  onClose,
  onSubmit,
  text,
}) => (
  <Modal onClose={onClose}>
    <Form
      fields={{
        text: <InputText label='Текст' required value={text} />,
      }}
      onSubmit={onSubmit}
      sendText='OK'
      title='Настройка текста'
    />
  </Modal>
);
