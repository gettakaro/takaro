import { FC, useState } from 'react';
import { useController } from 'react-hook-form';
import { Option } from '.';
import {
  ControlledInputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';
import { Label } from '../../../components';
import { FieldSet, Container } from './style';
import { GenericRadio } from './Radio';

export interface ControlledRadioGroupProps extends ControlledInputProps {
  options: Option[];
}

const defaultsApplier =
  defaultInputPropsFactory<ControlledRadioGroupProps>(defaultInputProps);

export const ControlledRadioGroup: FC<ControlledRadioGroupProps> = (props) => {
  const {
    readOnly,
    name,
    size,
    label,
    options,
    control,
    required,
    disabled,
    hint,
    description,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [selected, setSelected] = useState<string>(
    // check if value exists in options
    options.some((option) => option.value === field.value)
      ? field.value
      : options[0].value
  );

  const handleChange = (val: string) => {
    if (readOnly || disabled) return;
    setSelected(val);
    field.onChange(val);
  };

  // TODO: implement loading state

  return (
    <FieldSet>
      <legend>{label}</legend>
      <div>
        {options.map(({ label, labelPosition, value }) => {
          return (
            <Container
              isSelected={value === selected}
              onClick={() => handleChange(value)}
            >
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
                  onClick={() => handleChange(value)}
                />
              )}
              <GenericRadio
                hasError={!!error}
                readOnly={readOnly}
                disabled={disabled}
                required={required}
                name={name}
                id={name}
                value={value}
                selected={selected === value}
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
                  onClick={() => handleChange(value)}
                />
              )}
            </Container>
          );
        })}
      </div>
      <p>{description}</p>
    </FieldSet>
  );
};
