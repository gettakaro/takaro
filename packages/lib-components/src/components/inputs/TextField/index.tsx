import { FC, cloneElement, useState, ReactElement, ChangeEvent } from 'react';
import {
  Container,
  InputContainer,
  Input,
  PrefixContainer,
  SuffixContainer,
} from './style';

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
  marginBottom?: string;
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
    marginBottom,
  } = defaultsApplier(props);

  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(false);
  };

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (type === 'number' && !isNaN(parseInt(event.target.value))) {
      // try to parse first
      field.onChange(parseInt(event.target.value));
      return;
    }
    field.onChange(event.target.value);
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
            error={!!error}
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
    <Container marginBottom={marginBottom}>
      {label && (
        <Label
          required={required}
          hint={hint}
          htmlFor={name}
          error={!!error}
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
          {...field}
          autoCapitalize="off"
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          hasError={!!error}
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
      {error && showError && <ErrorMessage message={error.message!} />}
      {props.description && <p>{props.description}</p>}
    </Container>
  );
};
