import React from 'react';

import Form from 'components/Form';
import { InputNumber } from 'components/Input';
import Modal from 'components/Modal';

interface IEffectFormResult {
  animationSpeed: number;
  repeatX: number;
  repeatY: number;
}

interface IEffectFormProps extends IEffectFormResult {
  onClose: () => void;
  onSubmit: (result: IEffectFormResult) => void;
}

export const EffectForm: React.FC<IEffectFormProps> = ({
  animationSpeed,
  onClose,
  onSubmit,
  repeatX,
  repeatY,
}) => (
  <Modal onClose={onClose}>
    <Form
      fields={{
        repeatX: (
          <InputNumber
            label='Повторить по горизонтали'
            name='repeatX'
            required
            value={`${repeatX}`}
          />
        ),
        repeatY: (
          <InputNumber
            label='Повторить по вертикали'
            name='repeatY'
            required
            value={`${repeatY}`}
          />
        ),
        animationSpeed: (
          <InputNumber
            label='Циклов в секунду'
            name='speed'
            required
            value={`${animationSpeed}`}
          />
        ),
      }}
      onSubmit={({ animationSpeed, repeatX, repeatY }) =>
        onSubmit({
          animationSpeed: +animationSpeed,
          repeatX: +repeatX,
          repeatY: +repeatY,
        })
      }
      sendText='OK'
      title='Настройка эффекта'
    />
  </Modal>
);
