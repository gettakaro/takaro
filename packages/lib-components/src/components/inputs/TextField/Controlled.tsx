import { FC, useState } from 'react';
import { useController } from 'react-hook-form';
import {
  ControlledInputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';
import { TextFieldProps, GenericTextField } from '.';
import { Wrapper, Container, InputContainer } from './style';
import { Label, ErrorMessage } from '../../../components';

export type ControlledTextFieldProps = ControlledInputProps & TextFieldProps;

const defaultsApplier =
  defaultInputPropsFactory<ControlledTextFieldProps>(defaultInputProps);

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

  const { field, fieldState } = useController({
    name,
    control,
  });

  const [showError, setShowError] = useState<boolean>(false);

  const handleOnFocus = () => {
    setShowError(true);
  };

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(false);
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <Wrapper>
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
              if (Number(e.target.value)) {
                field.onChange(Number(e.target.value));
              } else {
                field.onChange(null);
              }
              if (e.target.value === '') {
                field.onChange(null);
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
        />
        {fieldState.error && fieldState.error.message && showError && (
          <ErrorMessage message={fieldState.error.message} />
        )}
        {description && <p>{description}</p>}
      </Container>
    </Wrapper>
  );
};
