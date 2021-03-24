import * as React from 'react';
import cn from 'classnames';
import * as equal from 'react-fast-compare';

import Button, { TButtonType } from '../Button';
import { CheckBoxAgree } from '../CheckBox/CheckBox';
import { IValidationResults, setValidation } from '../Validation';

export enum Statuses {
  loading = 'loading',
  ready = 'ready',
  error = 'error',
  sending = 'sending',
  success = 'success',
  fail = 'fail',
}

export type TFormData = { [key: string]: any };
export type TFormHandlers = {
  [key: string]: TFormSubmit;
};

export type TFormSubmit = (
  data: TFormData,
  onSuccessHook: () => void,
  onErrorHook: (error: string) => void,
) => void;

type TFields = { [key: string]: JSX.Element };

interface IFormProps {
  buttons?: React.ReactNode[];
  children?: React.ReactChild;
  className?: string;
  error?: string;
  failText?: string;
  fields: TFields;
  hideSubmit?: boolean;
  needAgreement?: boolean;
  noFocus?: boolean;
  onSubmit?: TFormSubmit;
  onSuccess?(): void;
  onValidate?(results: IValidationResults): void;
  renderAsDiv?: boolean;
  sendText: string;
  sendingText?: string;
  submitType?: TButtonType;
  successText?: string;
  title?: React.ReactNode;
  validateOnStart?: boolean;
}

interface IFormState {
  error: string;
  status: Statuses;
  validated: boolean;
  validInputsLeft: number;
}

export default class Form extends React.PureComponent<IFormProps, IFormState> {
  static displayName: 'Form';

  fields: TFields;
  inputs: React.ReactElement[];
  isValid: () => boolean;
  inputsData: { [key: string]: any };
  firstInput: any;

  constructor(props: IFormProps) {
    super(props);

    const { error, fields, validateOnStart } = props;

    this.initInputs(fields, validateOnStart);
    this.state = {
      error,
      status: this.isValid() ? Statuses.ready : Statuses.error,
      validated: props.validateOnStart,
      validInputsLeft: 0,
    };
  }

  componentDidMount() {
    this.setFocus();
  }

  componentDidUpdate(prevProps: IFormProps) {
    const { error, fields } = this.props;

    if (!equal(prevProps.fields, fields)) {
      this.initInputs(fields, this.state.validated);
      this.setState({
        status: this.isValid() ? Statuses.ready : Statuses.error,
      });
    }

    if (prevProps.error !== error) {
      this.setState({ error });
    }
  }

  setFocus() {
    if (!this.props.noFocus && this.firstInput && this.firstInput.current) {
      this.firstInput.current.focus();
    }
  }

  onFocus() {
    document.querySelector('main').scrollTo(0, 0);
  }

  initInputs(fields: TFields, validateOnStart: boolean) {
    this.fields = Object.keys(fields).reduce((result: TFields, key, index) => {
      const newProps: any = {
        onFocus: this.onFocus,
        showError: validateOnStart,
      };

      if (!index) {
        this.firstInput = React.createRef<HTMLInputElement>();
        newProps.ref = this.firstInput;
      }

      result[key] = React.cloneElement(fields[key], newProps);
      return result;
    }, {});

    if (this.props.needAgreement) {
      this.fields.agree = <CheckBoxAgree required onFocus={this.onFocus} />;
    }

    const { inputs, isValid } = setValidation(
      this.fields,
      this.onChange,
      this.inputsData,
    );

    this.isValid = isValid;

    this.inputs = Object.values(inputs);
  }

  onSuccess = () => this.setState({ status: Statuses.success });

  onError = (error: string) => {
    this.setState({ error, status: Statuses.ready });
  };

  onSubmit = (event: React.FormEvent<HTMLButtonElement | HTMLFormElement>) => {
    event.preventDefault();

    const { fields, onSubmit } = this.props;

    if (this.isValid()) {
      this.setState({ status: Statuses.sending });

      if (onSubmit) {
        onSubmit(this.inputsData, this.onSuccess, this.onError);
      }
    } else if (!this.state.validated) {
      this.initInputs(fields, true);
      this.setState({ validated: true });
    }
  };

  onChange = (inputKey: string, results: IValidationResults) => {
    if (!this.inputsData) {
      this.inputsData = {};
    }

    this.inputsData[inputKey] = results[inputKey].value;

    const { onValidate } = this.props;

    if (onValidate) {
      onValidate(results);
    }

    if (!this.state) {
      return;
    }

    const { status } = this.state;

    if (![Statuses.ready, Statuses.error].includes(status)) {
      return;
    }

    const newStatus = this.isValid() ? Statuses.ready : Statuses.error;

    if (newStatus !== status) {
      this.setState({ status: newStatus });
    }
  };

  renderForm = (props: any) =>
    this.props.renderAsDiv ? (
      <div {...props} />
    ) : (
      <form {...props} onSubmit={this.onSubmit} />
    );

  render() {
    const {
      buttons,
      children,
      className,
      failText,
      hideSubmit,
      sendText,
      sendingText,
      submitType,
      successText,
      title,
    } = this.props;
    const { error, status, validated } = this.state;
    const isButtonDisabled =
      validated && ![Statuses.ready, Statuses.success].includes(status);
    const statusesText: { [key: string]: string } = {
      [Statuses.sending]: sendingText,
      [Statuses.success]: successText,
      [Statuses.fail]: failText,
    };
    const buttonText = statusesText[status] ? statusesText[status] : sendText;
    const COMPONENT = this.renderForm;

    return (
      <COMPONENT
        className={cn(
          className,
          'form',
          `form--${validated ? status : Statuses.ready}`,
        )}
      >
        {title && <div className='form__title title'>{title}</div>}
        {this.inputs}
        {children}
        {error && <div className='form__error'>{error}</div>}
        <div className='form__buttons'>
          {!hideSubmit && (
            <div className='form__button form__button--main'>
              <Button
                text={buttonText}
                type={submitType || 'main2'}
                onClick={this.onSubmit}
                disabled={isButtonDisabled}
                shadow
              />
            </div>
          )}
          {buttons &&
            buttons.map((button, index) => (
              <div className='form__button' key={index}>
                {button}
              </div>
            ))}
        </div>
      </COMPONENT>
    );
  }
}
