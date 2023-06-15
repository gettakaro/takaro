import { FC, useState } from 'react';
import { TextAreaFieldProps, GenericTextAreaField } from '.';
import {
  ControlledInputProps,
  defaultInputPropsFactory,
  defaultInputProps,
} from '../InputProps';
import { Container, TextAreaContainer } from './style';
import { Label, ErrorMessage } from '../../../components';
import { useController } from 'react-hook-form';

export type ControlledTextAreaFieldProps = TextAreaFieldProps &
  ControlledInputProps;

const defaultsApplier =
  defaultInputPropsFactory<ControlledTextAreaFieldProps>(defaultInputProps);

export const ControlledTextAreaField: FC<ControlledTextAreaFieldProps> = (
  props
) => {
  const {
    loading,
    label,
    hint,
    disabled,
    required,
    description,
    placeholder,
    control,
    name,
    rows = 5,
    size,
    readOnly,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [showError, setShowError] = useState<boolean>(false);

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
            error={!!error}
            size={size}
            disabled={disabled}
            text={label}
            position="top"
          />
        )}
        <TextAreaContainer className="placeholder" />
      </Container>
    );
  }

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
          hint={hint}
          position="top"
        />
      )}
      <GenericTextAreaField
        name={name}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        value={field.value}
        onBlur={handleOnBlur}
        onChange={field.onChange}
        hasError={!!error}
        ref={field.ref}
      />
      {error && error.message && showError && (
        <ErrorMessage message={error.message} />
      )}
      {description && <p>{description}</p>}
    </Container>
  );
};
