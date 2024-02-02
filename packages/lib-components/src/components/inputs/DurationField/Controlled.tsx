import { FC, useState } from 'react';
import { useController } from 'react-hook-form';
import { ControlledInputProps, defaultInputProps, defaultInputPropsFactory } from '../InputProps';
import { DurationProps, GenericDurationField } from './Generic';
import { Container } from './style';
import { InputWrapper, Description, ErrorMessage, Label } from '../layout';

export type ControlledDurationFieldProps = DurationProps & ControlledInputProps;
const defaultsApplier = defaultInputPropsFactory<ControlledDurationFieldProps>(defaultInputProps);

export const ControlledDurationField: FC<ControlledDurationFieldProps> = (props) => {
  const { name, required, readOnly, disabled, size, label, placeholder, control, hint, description, canClear } =
    defaultsApplier(props);

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
    setShowError(true);
  };
  const handleOnFocus = () => {
    setShowError(false);
  };

  return (
    <InputWrapper>
      <Container>
        {label && (
          <Label
            text={label}
            htmlFor={name}
            error={false}
            disabled={disabled}
            required={required}
            position="top"
            size="medium"
            hint={hint}
          />
        )}

        <GenericDurationField
          readOnly={readOnly}
          size={size}
          name={name}
          id={name}
          ref={field.ref}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          onChange={field.onChange}
          placeholder={placeholder}
          hasError={!!error}
          hasDescription={!!description}
          disabled={disabled}
          value={field.value}
          canClear={canClear}
        />
        {error && error.message && showError && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};
