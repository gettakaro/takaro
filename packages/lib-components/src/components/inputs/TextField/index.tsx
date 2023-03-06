import { FC, cloneElement, useState, ReactElement } from 'react';
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

export interface TextFieldProps extends InputProps {
  icon?: ReactElement;
  readOnly?: boolean;
  placeholder: string;
  prefix?: string;
  suffix?: string;
  type?: 'text' | 'password';
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
    error,
    disabled,
    required,
    name,
    size,
    readOnly,
    placeholder,
    icon,
    type = 'text',
    prefix,
    suffix,
  } = defaultsApplier(props);

  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { field } = useController({ name, control, defaultValue: value });

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(false);
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
    <Container>
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
          id={name}
          name={name}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          role="presentation"
          type={type === 'text' || showPassword ? 'search' : 'password'}
        />
        {type === 'password' &&
          (showPassword ? (
            <HidePasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(false);
              }}
              size="24"
            />
          ) : (
            <ShowPasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(true);
              }}
              size="24"
            />
          ))}
        {suffix && <SuffixContainer>{suffix}</SuffixContainer>}
      </InputContainer>
      {error && showError && <ErrorMessage message={error.message!} />}
    </Container>
  );
};
