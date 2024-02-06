import { FC, useState } from 'react';
import { useController } from 'react-hook-form';
import { ControlledInputProps, defaultInputProps, defaultInputPropsFactory } from '../InputProps';
import { FileFieldProps, GenericFileField } from '.';
import { Container, InputContainer } from './style';
import { Label, ErrorMessage, InputWrapper, Description } from '../layout';

export type ControlledFileFieldProps = ControlledInputProps & FileFieldProps;

const defaultsApplier = defaultInputPropsFactory<ControlledFileFieldProps>(defaultInputProps);

export const ControlledFileField: FC<ControlledFileFieldProps> = (props) => {
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
    multiple = false,
    placeholder,
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
        <GenericFileField
          hasError={!!fieldState.error}
          disabled={disabled}
          name={name}
          id={name}
          required={required}
          size={size}
          multiple={multiple}
          readOnly={readOnly}
          onChange={field.onChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          value={field.value}
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
