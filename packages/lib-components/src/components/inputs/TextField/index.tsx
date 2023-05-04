import { FC, cloneElement, useState, ReactElement, ChangeEvent } from 'react';
import {
  Container,
  InputContainer,
  Input,
  PrefixContainer,
  SuffixContainer,
} from './style';

import { Size } from '../../../styled';

import { ErrorMessage } from '../ErrorMessage';
import { Label } from '../Label';
import { useController } from 'react-hook-form';
import {
  AiOutlineEye as ShowPasswordIcon,
  AiOutlineEyeInvisible as HidePasswordIcon,
} from 'react-icons/ai';
import {
  InputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';
import { getFieldType, getInputMode } from './util';

export type FieldType = 'text' | 'password' | 'email' | 'number';

export interface TextFieldProps extends InputProps {
  icon?: ReactElement;
  readOnly?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  type?: FieldType;
}

const defaultsApplier =
  defaultInputPropsFactory<TextFieldProps>(defaultInputProps);

export const TextField: FC<TextFieldProps> = (props) => {
  const {
    control,
    loading,
    value,
    label,
    hint,
    disabled,
    required,
    name,
    size,
    readOnly,
    placeholder = '',
    icon,
    type = 'text',
    prefix,
    suffix,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: value ?? '',
    rules: {
      required: required,
    },
  });

  return (
    <GenericTextField
      errorMessage={error?.message}
      {...field}
      onChange={field.onChange}
      disabled={disabled}
      required={required}
      loading={loading}
      type={type}
      icon={icon}
      size={size}
      name={name}
      label={label}
      hint={hint}
      prefix={prefix}
      suffix={suffix}
      readOnly={readOnly}
      placeholder={placeholder}
    />
  );
};

interface GenericTextFieldProps {
  onChange: any;
  errorMessage: string | undefined;
  type?: FieldType;
  loading: boolean;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: Size;
  name: string;
  prefix?: string;
  suffix?: string;
  icon?: any;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
  description?: string;
}

export const GenericTextField: FC<GenericTextFieldProps> = ({
  onChange,
  errorMessage,
  type = 'text',
  loading,
  label,
  required = false,
  size = 'medium',
  disabled = false,
  name,
  prefix,
  description,
  suffix,
  readOnly = false,
  hint,
  placeholder = '',
  icon,
}) => {
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleOnBlur = () => {
    // field.onBlur();
    setShowError(false);
  };

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (type === 'number' && !isNaN(parseInt(event.target.value))) {
      // try to parse first
      onChange(parseInt(event.target.value));
      return;
    }
    onChange(event.target.value);
  };

  const handleOnFocus = () => {
    setShowError(true);
  };

  if (loading) {
    return (
      <Container>
        {label && (
          <Label
            required={required}
            htmlFor={name}
            error={!!errorMessage}
            size={size}
            disabled={disabled}
            text={label}
            position="top"
          />
        )}
        <InputContainer className="placeholder" />
      </Container>
    );
  }

  return (
    <Container>
      {label && (
        <Label
          required={required}
          hint={hint}
          htmlFor={name}
          error={!!errorMessage}
          size={size}
          text={label}
          disabled={disabled}
          position="top"
        />
      )}
      <InputContainer>
        {prefix && <PrefixContainer>{prefix}</PrefixContainer>}
        {icon && cloneElement(icon, { size: 22, className: 'icon' })}
        <Input
          autoCapitalize="off"
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          hasError={!!errorMessage}
          hasIcon={!!icon}
          hasPrefix={!!prefix}
          hasSuffix={!!suffix}
          isPassword={type === 'password'}
          id={name}
          name={name}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          role="presentation"
          inputMode={getInputMode(type)}
          type={getFieldType(type, showPassword)}
        />
        {type === 'password' &&
          (showPassword ? (
            <HidePasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(false);
              }}
              size="22"
            />
          ) : (
            <ShowPasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(true);
              }}
              size="22"
            />
          ))}
        {suffix && <SuffixContainer>{suffix}</SuffixContainer>}
      </InputContainer>
      {errorMessage && showError && <ErrorMessage message={errorMessage} />}
      {description && <p>{description}</p>}
    </Container>
  );
};
