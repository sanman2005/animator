import * as React from 'react';
import { ValidationComponent, IValidationProps, Reasons } from '../Validation';
import cn from 'classnames';

export interface ICheckBoxProps extends IValidationProps {
  checkToBack?: boolean;
  key?: string;
  labelOff: React.ReactNode;
  labelOn?: React.ReactNode;
  name: string;
  ref?: (input: any) => void;
  toggleStyle?: boolean;
  toggleLabel?: string;
  value?: boolean;
}

interface IState {
  value: boolean;
}

export default class CheckBox extends ValidationComponent<
  ICheckBoxProps,
  IState
> {
  onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { value } = this.state;
    const { name, onChange, onFocus } = this.props;

    this.setState({ value: !value });

    if (onChange) {
      onChange(value, name);
    }

    if (onFocus) {
      onFocus(name, event.currentTarget);
    }

    return true;
  }

  render() {
    const {
      checkToBack,
      key,
      labelOn,
      labelOff,
      name,
      ref,
      required,
      showError,
      toggleStyle,
      toggleLabel,
    } = this.props;
    const { value } = this.state;
    const text = <div>{value ? labelOn || labelOff : labelOff}</div>;
    const error = this.validationError;
    const fieldClass = cn('input-check', {
      'input-check--error': error && showError,
      'input-check--reverse': checkToBack,
      'input-check--required': required,
      'input-check--toggle': toggleStyle,
    });

    return (
      <div className={fieldClass}>
        {toggleLabel && <div className='input-check__label'>{toggleLabel}</div>}
        <label>
          {toggleStyle ? labelOff : checkToBack && text}
          <input
            type='checkbox'
            name={name || key}
            checked={value}
            onChange={this.onChange}
            ref={ref}
          />
          <span className='input-check__box'>
            {toggleStyle && (value ? labelOn : labelOff)}
          </span>
          {toggleStyle ? labelOn : !checkToBack && text}
          {error && showError && (
            <span className='input-check__error'>{this.validationError}</span>
          )}
        </label>
      </div>
    );
  }
}

// tslint:disable-next-line:variable-name
export const CheckBoxAgree = (
  props: IValidationProps & Pick<ICheckBoxProps, 'checkToBack'>,
) => (
  <CheckBox
    {...props}
    name='agree'
    labelOff='Я согласен на обработку персональных данных'
    required
    validationTexts={{
      [Reasons.required]: 'Необходимо согласие на обработку',
    }}
  />
);
