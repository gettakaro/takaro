import { FC, useState } from 'react';
import { useController } from 'react-hook-form';
import { ControlledInputProps, defaultInputProps, defaultInputPropsFactory } from '../InputProps';
import { TextFieldProps, GenericTextField } from '.';
import { isNumber } from './util';
import { Container, InputContainer } from './style';
import { Label, ErrorMessage, InputWrapper, Description } from '../layout';

export type ControlledTextFieldProps = ControlledInputProps & TextFieldProps;

const defaultsApplier = defaultInputPropsFactory<ControlledTextFieldProps>(defaultInputProps);

export const ControlledTextField: FC<ControlledTextFieldProps> = (props) => {
  const {
    description,
    loading,
    label,
    hint,
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
    control,
  } = defaultsApplier(props);

  const [showError, setShowError] = useState<boolean>(false);
  const { field, fieldState } = useController({
    name,
    control,
  });

  const handleOnFocus = () => {
    setShowError(true);
  };

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(false);
  };

  if (loading) {
    return (
      <InputWrapper>
        <Container>
          {label && (
            <Label
              required={required}
              htmlFor={name}
              error={!!fieldState.error}
              size={size}
              disabled={disabled}
              text={label}
              position="top"
            />
          )}
          <InputContainer className="placeholder" />
        </Container>
      </InputWrapper>
    );
  }

  return (
    <InputWrapper>
      <Container>
        {label && (
          <Label
            required={required}
            hint={hint}
            htmlFor={name}
            error={!!fieldState.error}
            size={size}
            text={label}
            disabled={disabled}
            position="top"
          />
        )}
        <GenericTextField
          hasError={!!fieldState.error}
          disabled={disabled}
          name={name}
          id={name}
          required={required}
          size={size}
          readOnly={readOnly}
          onChange={(e) => {
            if (type === 'number') {
              if (isNumber(e.target.value)) {
                field.onChange(Number(e.target.value));
              } else {
                field.onChange(undefined);
              }
            } else {
              field.onChange(e.target.value);
            }
          }}
          onFocus={handleOnFocus}
          prefix={prefix}
          suffix={suffix}
          icon={icon}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          value={field.value}
          type={type}
          ref={field.ref}
          hasDescription={!!description}
        />
        {fieldState.error && fieldState.error.message && showError && (
          <ErrorMessage message={fieldState.error.message} />
        )}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};
