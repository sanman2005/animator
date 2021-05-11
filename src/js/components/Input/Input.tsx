import * as React from 'react';
import InputMask from 'react-input-mask';
import cn from 'classnames';
import Textarea from 'react-textarea-autosize';

import {
  Reasons,
  ValidationComponent,
  IValidationProps,
  IValidationState,
} from '../Validation';

import {
  emailPattern,
  namePattern,
  passwordPattern,
  phonePattern,
} from '../../helpers';

import Icons from '../icons';
import i18n from 'js/i18n';

export const phoneMask = '+7 (999) 999-99-99';

interface IInputProps extends IValidationProps {
  accept?: string;
  autocomplete?: string;
  className?: string;
  mask?: string;
  onChange?(value: string, name?: string, target?: TInput): void;
  onClick?(event: React.FormEvent): void;
  type?: string;
  value?: string;
  isTextarea?: boolean;
  isSelect?: boolean;
}

interface IInputState {
  value: string;
}

type TInput = HTMLInputElement | HTMLTextAreaElement;
type TRef = React.RefObject<TInput>;
type TRefInput = React.RefObject<HTMLInputElement>;
type TRefText = React.RefObject<HTMLTextAreaElement>;

// tslint:disable:variable-name
export const Input = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => {
    class InputComponent extends ValidationComponent<IInputProps, IInputState> {
      onChange = (event: React.FormEvent<TInput>) => {
        const { value } = event.currentTarget;
        const { onChange, name } = this.props;

        this.setState({ value });

        if (onChange) {
          onChange(value, name, event.currentTarget);
        }

        event.currentTarget.focus();
      };

      onFocus = (event: React.FormEvent<TInput>) => {
        const { onFocus, name } = this.props;

        if (onFocus) {
          onFocus(name, event.currentTarget);
        }

        return true;
      };

      render() {
        const {
          autocomplete,
          className,
          isTextarea,
          label,
          name,
          mask,
          onClick,
          required,
          type,
          showError,
        } = this.props;
        const { value } = this.state;
        const inputParams: any = {
          autoComplete: autocomplete,
          name,
          onClick,
          value,
          type,
          onChange: this.onChange,
          onFocus: this.onFocus,
        };
        const error = this.validationError;
        const fieldClass = cn('input', className, {
          'input--error': error && showError,
          'input--text': isTextarea,
          'input--required': required,
        });

        const labelClass = cn('input__label', {
          'input__label--not-empty': value,
        });

        if (isTextarea && ref) {
          inputParams.inputRef = ref as TRefText;
        }

        const input = mask ? (
          <InputMask {...inputParams} mask={mask} />
        ) : isTextarea ? (
          <Textarea {...inputParams} maxRows={15}>
            {value}
          </Textarea>
        ) : (
          <input {...inputParams} ref={ref as TRefInput} />
        );

        return (
          <fieldset className={fieldClass} data-value={value}>
            {input}
            <span className={labelClass}>{label}</span>
            {error && showError && (
              <span className='input__error'>{error}</span>
            )}
          </fieldset>
        );
      }
    }

    return <InputComponent {...props} />;
  },
);

export const InputName = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      ref={ref}
      label={i18n`name`}
      pattern={namePattern}
      validationTexts={{
        [Reasons.required]: i18n`enter text`,
        [Reasons.pattern]: i18n`fieldLettersOnly`,
      }}
      {...props}
    />
  ),
);

export const InputEmail = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      label='Email'
      type='email'
      ref={ref}
      pattern={emailPattern}
      required
      validationTexts={{
        [Reasons.required]: i18n`enter email`,
        [Reasons.pattern]: i18n`emailFormat`,
      }}
      {...props}
    />
  ),
);

export const InputPassword = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      type='password'
      label={i18n`password`}
      ref={ref}
      autocomplete='off'
      required
      minLength={6}
      pattern={passwordPattern}
      validationTexts={{
        [Reasons.required]: i18n`enter password`,
        [Reasons.minLength]: i18n`passwordShort`,
        [Reasons.pattern]: i18n`passwordInvalidSymbols`,
      }}
      {...props}
    />
  ),
);

export const InputPhone = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      label='Телефон'
      mask={phoneMask}
      pattern={phonePattern}
      ref={ref}
      required
      validationTexts={{
        [Reasons.required]: 'Введите номер телефона',
        [Reasons.pattern]: 'Номер телефона введен не полностью',
      }}
      {...props}
    />
  ),
);

export const InputSms = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      label='Одноразовый пароль'
      mask='9 9 9 9'
      pattern='^(\d\s){3}\d$'
      ref={ref}
      required
      validationTexts={{
        [Reasons.required]: 'Введите код из СМС',
        [Reasons.pattern]: 'Код из СМС должен состоять из 4-ех цифр',
      }}
      {...props}
    />
  ),
);

export const InputText = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      isTextarea
      ref={ref}
      maxLength={1000}
      validationTexts={{
        [Reasons.required]: i18n`enter text`,
        [Reasons.maxLength]: i18n`text tooLong`,
      }}
      {...props}
    />
  ),
);

export const InputNumber = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      ref={ref}
      maxLength={6}
      pattern='^\d+(\.\d+)?$'
      validationTexts={{
        [Reasons.required]: 'Введите число',
        [Reasons.pattern]: 'Это не число',
        [Reasons.maxLength]: 'Слишком длинное число',
      }}
      {...props}
    />
  ),
);

export type TInputFileProps = {
  accept?: string;
  onInit?: (input: TRef) => void;
  onChange: (url: string, file: Blob) => void;
};

export const InputFile = React.forwardRef<TInput, TInputFileProps>(
  ({ accept, onChange, onInit }, ref: TRef) => {
    React.useEffect(() => {
      if (onInit && ref) {
        onInit(ref);
      }
    }, [onInit]);

    const onFileChange: IInputProps['onChange'] = React.useCallback(
      (event, name, target) => {
        const file: Blob = (target as HTMLInputElement).files[0];
        const fileReader = new FileReader();

        if (!file) {
          onChange('', null);
          return;
        }

        fileReader.readAsDataURL(file);
        fileReader.addEventListener('loadend', (readerEvent: any) =>
          onChange(readerEvent.target.result, file),
        );
      },
      [onChange],
    );

    return (
      <Input
        accept={accept || '.jpg, .jpeg, .png'}
        onChange={onFileChange}
        ref={ref}
        type='file'
      />
    );
  },
);

type TInputImageProps = {
  label?: string;
  url?: string;
} & IValidationProps;

type TInputImageState = {
  file: Blob;
  url: string;
} & IValidationState;

export class InputImage extends ValidationComponent<
  TInputImageProps,
  TInputImageState
> {
  constructor(props: TInputImageProps) {
    super(props);

    this.state = {
      ...this.state,
      file: null,
      url: this.props.url || '',
    };
  }

  onChange = (url: string, file: Blob) => {
    const { onChange, name } = this.props;

    this.setState({
      file,
      url,
      value: file,
      validation: this.state.validation,
    });

    if (onChange) {
      onChange(file, name);
    }
  };

  render() {
    const { url } = this.state;

    return (
      <fieldset className='input input-image'>
        <img src={url} alt='' />
        <label className='input-image__label'>
          {this.props.label}
          <InputFile onChange={this.onChange} />
        </label>
        <div className='input-image__camera'>
          <Icons.camera />
        </div>
        {url && (
          <div
            className='input-image-delete'
            onClick={() => this.onChange('', null)}
          />
        )}
      </fieldset>
    );
  }
}

export default Input;
