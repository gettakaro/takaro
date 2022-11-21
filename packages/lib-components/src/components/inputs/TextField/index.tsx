import { FC, cloneElement, useState } from 'react';
import {
  Container,
  InputContainer,
  Input,
  ErrorContainer,
  Error,
  PrefixContainer,
  SuffixContainer,
} from '../Field/style';
import { Label } from '../Label';
import { FieldProps } from '../..';
import { useController } from 'react-hook-form';
import {
  AiOutlineEye as ShowPasswordIcon,
  AiOutlineEyeInvisible as HidePasswordIcon,
} from 'react-icons/ai';

export const TextField: FC<FieldProps> = ({
  control,
  label,
  placeholder,
  name,
  prefix,
  suffix,
  error,
  icon,
  readOnly,
  hint,
  required,
  type = 'text',
  loading = false,
  size,
  disabled,
}) => {
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    field: { ref, ...inputProps },
  } = useController({ name, control });

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
        <Label
          required={required}
          htmlFor={name}
          error={!!error}
          size={size}
          disabled={disabled}
          text={label}
          position="top"
        />
        <InputContainer className="placeholder" />
      </Container>
    );
  }

  return (
    <Container>
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
          type={
            type === 'text' ? 'search' : showPassword ? 'search' : 'password'
          }
        />
        {type === 'password' ? (
          showPassword ? (
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
          )
        ) : null}
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
