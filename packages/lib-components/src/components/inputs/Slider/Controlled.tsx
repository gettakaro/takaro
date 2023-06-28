import { FC, PropsWithChildren } from 'react';
import { useController } from 'react-hook-form';
import {
  ControlledInputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';
import { SliderProps, GenericSlider } from '.';
import { Skeleton, Label, ErrorMessage } from '../../../components';
import { Container } from './style';
import { Description } from '../layout';

export type ControlledSliderProps = ControlledInputProps & SliderProps;

const defaultsApplier =
  defaultInputPropsFactory<PropsWithChildren<ControlledSliderProps>>(
    defaultInputProps
  );

export const ControlledSlider: FC<ControlledSliderProps> = (props) => {
  const {
    name,
    color = 'primary',
    size,
    min = 0,
    max = 10,
    step = 1,
    required,
    marks = [],
    disabled,
    loading,
    label,
    description,
    hint,
    control,
    readOnly,
    showTooltip = true,
    showDots = false,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  if (loading) {
    return <Skeleton height="6px" variant="text" width="100%" />;
  }

  return (
    <Container>
      {label && (
        <Label
          position="top"
          size={size}
          text={label}
          required={required}
          error={!!error}
          htmlFor={name}
          hint={hint}
          disabled={disabled}
        />
      )}
      <GenericSlider
        disabled={disabled}
        name={name}
        id={name}
        required={required}
        min={min}
        max={max}
        size={size}
        value={field.value}
        marks={marks}
        showDots={showDots}
        hasError={!!error}
        hasDescription={!!description}
        step={step}
        readOnly={readOnly}
        showTooltip={showTooltip}
        color={color}
        onBlur={field.onBlur}
        onChange={field.onChange}
        ref={field.ref}
      />
      {description && (
        <Description description={description} inputName={name} />
      )}
      {error && error.message && <ErrorMessage message={error.message} />}
    </Container>
  );
};
