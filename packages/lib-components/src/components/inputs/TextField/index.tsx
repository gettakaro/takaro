import { FC, cloneElement, useState } from 'react';
import {
  Container,
  LabelContainer,
  Label,
  InputContainer,
  Input,
  ErrorContainer,
  Error,
  PrefixContainer,
  SuffixContainer
} from '../Field/style';
import { FieldProps } from '../..';
import { useController } from 'react-hook-form';
import {
  AiOutlineEye as ShowPasswordIcon,
  AiOutlineEyeInvisible as HidePasswordIcon
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
  loading = false
}) => {
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    field: { ref, ...inputProps }
  } = useController({ name, control });

  if (!hint && required) {
    hint = 'Required';
  } else if (hint && required) {
    hint += '*';
  }

  if (loading) {
    return (
      <Container>
        <LabelContainer>
          <Label htmlFor={name} showError={error ? true : false}>
            {label}
          </Label>
        </LabelContainer>
        <InputContainer className="placeholder" />
      </Container>
    );
  }

  return (
    <Container>
      <LabelContainer>
        <Label htmlFor={name} showError={error ? true : false}>
          {label}
          <span>{hint}</span>
        </Label>
      </LabelContainer>
      <InputContainer>
        {prefix && <PrefixContainer>{prefix}</PrefixContainer>}
        {icon && cloneElement(icon, { size: 22, className: 'icon' })}
        <Input
          {...inputProps}
          autoCapitalize="off"
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          hasError={error ? true : false}
          hasIcon={icon ? true : false}
          hasPrefix={prefix ? true : false}
          hasSuffix={suffix ? true : false}
          id={name}
          name={name}
          onBlur={(): void => {
            inputProps.onBlur();
            setShowError(false);
          }}
          onFocus={(): void => {
            setShowError(true);
          }}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={ref}
          role="presentation"
          type={type === 'text' ? 'search' : showPassword ? 'search' : 'password'}
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
