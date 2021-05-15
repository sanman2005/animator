import React from 'react';

import Form from 'components/Form';
import { InputFile, TInputFileProps } from 'components/Input';
import Modal from 'components/Modal';

export interface IUploadFormProps {
  category: string;
  error?: string;
  onClose: () => void;
  onLoad: (url: string, category: string, file: Blob) => void;
}

export const UploadForm: React.FC<IUploadFormProps> = React.memo(
  ({ category, error, onClose, onLoad }) => {
    const onChange = React.useCallback(
      (url: string, file: Blob) => {
        onLoad(url, category, file);
      },
      [category, onLoad],
    );

    return (
      <Modal onClose={onClose}>
        <Form
          error={error}
          fields={{
            file: (
              <InputFile accept='gif, jpg, jpeg, png' onChange={onChange} />
            ),
          }}
          onSubmit={onClose}
          sendText='Закрыть'
          title='Загрузка файла'
        />
      </Modal>
    );
  },
);
