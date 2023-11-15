import { FC } from 'react';
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

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

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
          hasError={!!error}
          disabled={disabled}
          name={name}
          id={name}
          required={required}
          size={size}
          readOnly={readOnly}
          onChange={field.onChange}
          value={field.value}
          hasDescription={!!description}
          format={format}
        />
        {error && error.message && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </Wrapper>
  );
};
