import * as React from 'react';
import { ValidationComponent, IValidationProps } from '../Validation/Validation';
import cn from 'classnames';

interface IRadioProps extends IValidationProps {
  onChange?: (value: boolean, name?: string) => void;
  value?: boolean;
}

interface IRadioState {
  value: boolean;
}

export default class Radio extends ValidationComponent<IRadioProps, IRadioState> {
  onChange = () => {
    const { onChange, name, value } = this.props;

    if (!value) {
      this.setState({ value: true });

      if (onChange) {
        onChange(true, name);
      }
    }
  }

  render() {
    const {
      label,
      name,
      showError,
      value,
    } = this.props;
    const inputParams = {
      type: 'radio',
      name,
      value,
      checked: value,
    };
    const error = this.validationError;
    const fieldClass = cn('radio', { 'radio--error': error && showError });

    return (
      <fieldset className={fieldClass} data-value={value} onClick={this.onChange}>
        <input {...inputParams} readOnly />
        <label className='radio__label'>{label}</label>
        {error && showError && <span className='radio__error'>{error}</span>}
      </fieldset>
    );
  }
}
