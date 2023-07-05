import { FC, useState } from 'react';
import { TextAreaFieldProps, GenericTextAreaField } from '.';
import { ControlledInputProps, defaultInputPropsFactory, defaultInputProps } from '../InputProps';
import { Container, TextAreaContainer } from './style';
import { useController } from 'react-hook-form';
import { Wrapper, Description, Label, ErrorMessage } from '../layout';

export type ControlledTextAreaFieldProps = TextAreaFieldProps & ControlledInputProps;

const defaultsApplier = defaultInputPropsFactory<ControlledTextAreaFieldProps>(defaultInputProps);

export const ControlledTextAreaField: FC<ControlledTextAreaFieldProps> = (props) => {
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
        <TextAreaContainer className="placeholder" />
      </Container>
    );
  }

  return (
    <Wrapper>
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
          id={name}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          value={field.value}
          onBlur={handleOnBlur}
          onChange={field.onChange}
          onFocus={handleOnFocus}
          hasError={!!error}
          hasDescription={!!description}
          ref={field.ref}
        />
        {error && error.message && showError && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </Wrapper>
  );
};
