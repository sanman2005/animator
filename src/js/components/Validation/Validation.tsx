import * as React from 'react';

import { clearField } from 'js/helpers';

export interface IValidationProps {
  label?: string;
  minLength?: number;
  maxLength?: number;
  name?: string;
  onChange?:
    | ((event: React.FormEvent<HTMLInputElement>) => void)
    | ((event: React.FormEvent<HTMLSelectElement>) => void)
    | ((value: any, name?: string) => void);
  onFocus?: (name: string, element: HTMLElement) => void;
  onValidate?(result: IValidationResult): void;
  pattern?: string;
  required?: boolean;
  showError?: boolean;
  validationTexts?: { [key: string]: string };
  value?: any;
}

export interface IValidationState {
  validation: IValidationResult;
  value: any;
}

export interface IValidationResult {
  success: boolean;
  value: any;
  reason?: Reasons;
}

export interface IValidationResults {
  [key: string]: IValidationResult;
}

interface IValidationInputs {
  [key: string]: JSX.Element;
}

export interface IValidation {
  inputs: { [key: string]: JSX.Element };
  results: IValidationResults;
  isValid: () => boolean;
}

export enum Reasons {
  required = 'required',
  minLength = 'minLength',
  maxLength = 'maxLength',
  pattern = 'pattern',
}

export const setValidation = (
  inputs: IValidationInputs,
  onValidateHook?: (inputKey: string, results: IValidationResults) => void,
  inputsData: { [key: string]: any } = {},
): IValidation => {
  const validation: IValidation = {
    inputs: {},
    results: {},
    isValid: () => true,
  };

  Object.keys(inputs).map((key) => {
    const component = inputs[key];

    if (!component) {
      return;
    }

    const { props } = component;

    if (component.type === 'div') {
      validation.inputs[key] = React.cloneElement(component, { ...props, key });
      return;
    }

    const value = typeof props.value === 'undefined'
      ? (inputsData && inputsData[key] || '')
      : props.value;
    const newProps = {
      ...props,
      key,
      value,
      name: key,
      onValidate: (result: IValidationResult) => {
        validation.results[key] = result;

        if (onValidateHook) {
          onValidateHook(key, validation.results);
        }
      },
    };

    validation.inputs[key] = React.cloneElement(component, newProps);
    validation.results[key] = validate(newProps.value, { ...newProps, onValidate: null });
    validation.isValid = () => checkValidation(validation);
  });

  return validation;
};

export const checkValidation = (validation: IValidation): boolean => !Object
  .keys(validation.results)
  .map(key => validation.results[key])
  .some(result => !result.success);

const validate = (valueRaw: any, props: any): IValidationResult => {
  const { required, minLength, maxLength, pattern, onValidate } = props;
  const value: any =
    typeof valueRaw === 'string' ? valueRaw.trim() : valueRaw || '';
  const result: IValidationResult = { success: true, value };
  const hasValue = !!(value instanceof Array ? value.length : value);

  if (required && !hasValue) {
    result.reason = Reasons.required;
  } else if (minLength && value && value.length < minLength) {
    result.reason = Reasons.minLength;
  } else if (maxLength && value && value.length > maxLength) {
    result.reason = Reasons.maxLength;
  } else if ((required || value) && pattern && typeof value === 'string'
    && !new RegExp(pattern).test(value)) {
    result.reason = Reasons.pattern;
  }

  if (result.reason) {
    result.success = false;
  }

  if (onValidate) {
    onValidate(result);
  }

  return result;
};

export class ValidationComponent<TProps, TState> extends React.Component<
  IValidationProps & TProps,
  IValidationState & TState
> {
  constructor(props: IValidationProps & TProps) {
    super(props);

    const { value } = props;
    const validationResult = validate(value, props);

    delete validationResult.reason;

    this.state = {
      ...this.state,
      value: typeof value === 'undefined' ? '' : value,
      validation: validationResult,
    };
  }

  get validationError() {
    const { reason } = this.state.validation;
    const { validationTexts } = this.props;

    if (reason && !validationTexts) {
      throw new Error('validationTexts must be set for component');
    }

    return reason ? validationTexts[reason] : '';
  }

  onChangeValue = (value: any) =>
    this.setState((state: IValidationState & TState) => ({
      ...state,
      validation: validate(value, this.props),
    }))

  componentDidMount() {
    const { value } = this.props;

    this.onChangeValue(typeof value === 'string' ? clearField(value) : value);
  }

  componentDidUpdate(
    prevProps: Readonly<IValidationProps & TProps>,
    prevState: Readonly<IValidationState & TState>,
  ): void {
    const { value } = this.state;

    if (prevState.value !== value) {
      this.onChangeValue(typeof value === 'string' ? clearField(value) : value);
    }
  }
}
