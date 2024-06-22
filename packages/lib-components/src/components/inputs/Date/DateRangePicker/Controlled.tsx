import { FC, useState } from 'react';
import { defaultInputProps, defaultInputPropsFactory, ControlledInputProps } from '../../InputProps';
import { useController } from 'react-hook-form';
import { GenericDateRangePicker, DateRangePickerProps } from './Generic';
import { Label, ErrorMessage, InputWrapper, Description } from '../../layout';
import { Container } from './style';
import { Skeleton } from '../../../../components';

export type ControlledDateRangePickerProps = ControlledInputProps & DateRangePickerProps;
const defaultsApplier = defaultInputPropsFactory<ControlledDateRangePickerProps>(defaultInputProps);

export const ControlledDateRangePicker: FC<ControlledDateRangePickerProps> = (props) => {
  const { label, name, size, hint, control, disabled, readOnly, required, loading, id, description, defaultValue } =
    defaultsApplier(props);

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
    <InputWrapper>
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
        {loading ? (
          <Skeleton variant="text" width="100%" height="38px" />
        ) : (
          <GenericDateRangePicker
            onChange={field.onChange}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            id={id}
            name={name}
            readOnly={readOnly}
            disabled={disabled}
            defaultValue={defaultValue}
            required={required}
            size={size}
            hasError={!!error}
            value={field.value}
            hasDescription={!!description}
          />
        )}
        {showError && error?.message && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};
