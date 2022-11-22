import { FC, cloneElement, useState, ReactElement } from 'react';
import {
  Container,
  InputContainer,
  Input,
  ErrorContainer,
  Error,
  PrefixContainer,
  SuffixContainer,
} from './style';
import { Label } from '../Label';
import { FieldProps } from '../..';
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

export interface FieldProps extends InputProps {
  icon?: ReactElement;
  readOnly?: boolean;
  placeholder: string;
  prefix?: string;
  suffix?: string;
  type?: 'text' | 'password';
}

const defaultsApplier = defaultInputPropsFactory<FieldProps>(defaultInputProps);

export const TextField: FC<FieldProps> = (props) => {
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

  const {
    field: { ref, ...inputProps },
  } = useController({ name, control, defaultValue: value });

  const handleOnBlur = () => {
    inputProps.onBlur();
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
          error={error ? true : false}
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
          {...inputProps}
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
          ref={ref}
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
      {error && (
        <ErrorContainer showError={showError}>
          <Error>{error.message}</Error>
        </ErrorContainer>
      )}
    </Container>
  );
};
