import React from 'react';

import Form from 'components/Form';
import { InputFile, TInputFileProps } from 'components/Input';
import Modal from 'components/Modal';

export interface IUploadFormProps {
  onClose: () => void;
  onLoad: TInputFileProps['onChange'];
}

export const UploadForm: React.FC<IUploadFormProps> = React.memo(
  ({ onClose, onLoad }) => (
    <Modal onClose={onClose}>
      <Form
        fields={{
          file: <InputFile accept='gif, jpg, jpeg, png' onChange={onLoad} />,
        }}
        onSubmit={onClose}
        sendText='Закрыть'
        title='Загрузка файла'
      />
    </Modal>
  ),
);
