import { FC, useState } from 'react';
import { defaultInputProps, defaultInputPropsFactory, ControlledInputProps } from '../../InputProps';
import { useController } from 'react-hook-form';
import { GenericDatePicker, DatePickerProps } from './Generic';
import { Label, ErrorMessage, InputWrapper, Description } from '../../layout';
import { Container } from './style';
import { Skeleton } from '../../../../components';

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
    mode,
    relativePickerOptions,
    timePickerOptions,
    placeholder,
    popOverPlacement,
    loading,
    description,
    allowFutureDates = true,
    allowPastDates = true,
    canClear,
    customDateFilter,
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
            customDateFilter={customDateFilter}
            allowFutureDates={allowFutureDates}
            allowPastDates={allowPastDates}
            popOverPlacement={popOverPlacement}
            hasDescription={!!description}
            relativePickerOptions={relativePickerOptions}
            timePickerOptions={timePickerOptions}
            format={format}
            placeholder={placeholder}
            mode={mode}
            canClear={canClear}
          />
        )}
        {showError && error?.message && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};
