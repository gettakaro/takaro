import { FC, useState } from 'react';
import { defaultInputProps, defaultInputPropsFactory, ControlledInputProps } from '../../InputProps';
import { useController } from 'react-hook-form';
import { GenericDatePicker, DatePickerProps } from './Generic';
import { Label, ErrorMessage, Wrapper, Description } from '../../layout';
import { Container } from './style';

export type ControlledDatePickerProps = ControlledInputProps & DatePickerProps;
const defaultsApplier = defaultInputPropsFactory<ControlledDatePickerProps>(defaultInputProps);

export const ControlledDatePicker: FC<ControlledDatePickerProps> = (props) => {
  const {
    label,
    name,
    size,
    hint,
    control,
    disabled,
    readOnly,
    required,
    format,
    // TODO: loading,
    description,
  } = defaultsApplier(props);

  const [showError, setShowError] = useState<boolean>(true);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const handleOnFocus = () => {
    setShowError(false);
  };

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(true);
  };

  return (
    <Wrapper>
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
        <GenericDatePicker
          onChange={field.onChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          value={field.value}
          disabled={disabled}
          name={name}
          id={name}
          required={required}
          size={size}
          readOnly={readOnly}
          hasError={!!error}
          hasDescription={!!description}
          format={format}
        />
        {showError && error?.message && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </Wrapper>
  );
};
