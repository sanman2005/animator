import React from 'react';

import Form from 'components/Form';
import { InputNumber } from 'components/Input';
import Modal from 'components/Modal';

import { IEffect } from 'js/types';

interface IEffectFormProps extends IEffect {
  onClose: () => void;
  onSubmit: (result: IEffect) => void;
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
            required
            value={`${repeatX}`}
          />
        ),
        repeatY: (
          <InputNumber
            label='Повторить по вертикали'
            required
            value={`${repeatY}`}
          />
        ),
        animationSpeed: (
          <InputNumber
            label='Циклов в секунду'
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
