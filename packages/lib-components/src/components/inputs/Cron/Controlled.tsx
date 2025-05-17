import { FC, useState } from 'react';
import { ControlledInputProps, defaultInputProps, defaultInputPropsFactory } from '../InputProps';
import { CronProps, GenericCron } from './Generic';
import { useController } from 'react-hook-form';
import { Description, ErrorMessage, InputWrapper, Label } from '../layout';
import { Container } from './style';
import { Skeleton } from '../../../components';

export type ControlledCronProps = ControlledInputProps & CronProps;
const defaultsApplier = defaultInputPropsFactory<ControlledCronProps>(defaultInputProps);

export const ControlledCron: FC<ControlledCronProps> = (props) => {
  const {
    label,
    name,
    size,
    hint,
    control,
    disabled,
    readOnly,
    required,
    popOverPlacement,
    canClear,
    description,
    loading,
  } = defaultsApplier(props);
  const [showError, setShowError] = useState<boolean>(true);

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

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
          <GenericCron
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
            popOverPlacement={popOverPlacement}
            canClear={canClear}
            hasDescription={!!description}
          />
        )}
        {showError && error?.message && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};
