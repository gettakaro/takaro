import { FC } from 'react';
import { ControlledInputProps } from '../../InputProps';
import { useController } from 'react-hook-form';
import { LabelPosition, RadioProps, GenericRadio } from '.';
import { Label } from '../../../../components';
import { Container, RadioContainer } from './style';

import { defaultInputProps, defaultInputPropsFactory } from '../../InputProps';

export type ControlledRadioProps = RadioProps &
  ControlledInputProps &
  LabelPosition;

const defaultsApplier =
  defaultInputPropsFactory<ControlledRadioProps>(defaultInputProps);

export const ControlledRadio: FC<ControlledRadioProps> = (props) => {
  const {
    readOnly,
    loading,
    name,
    size,
    required,
    value,
    selected,
    setSelected,
    labelPosition = 'left',
    label,
    disabled,
    control,
    hint,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  if (loading) {
    return (
      <Container isSelected={selected}>
        <RadioContainer
          isSelected={selected}
          className="placeholder"
          readOnly={true}
        />
      </Container>
    );
  }

  return (
    <Container isSelected={selected}>
      {label && labelPosition === 'left' && (
        <Label
          htmlFor={name}
          text={label}
          required={required}
          position={labelPosition}
          size={size}
          error={!!error}
          disabled={disabled}
          hint={hint}
        />
      )}
      <GenericRadio
        hasError={!!error}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        selected={selected}
        setSelected={setSelected}
        onChange={field.onChange}
        size={size}
      />

      {label && labelPosition === 'right' && (
        <Label
          htmlFor={name}
          position={labelPosition}
          required={required}
          error={!!error}
          text={label}
          size={size}
          disabled={disabled}
          hint={hint}
        />
      )}
    </Container>
  );
};
