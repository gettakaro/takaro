import { FC, useState } from 'react';
import { useController } from 'react-hook-form';
import { Option } from '.';
import {
  ControlledInputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';
import { ControlledRadio } from './Radio/Controlled';
import { FieldSet } from './style';

export interface ControlledRadioGroupProps extends ControlledInputProps {
  options: Option[];
}

const defaultsApplier =
  defaultInputPropsFactory<ControlledRadioGroupProps>(defaultInputProps);

export const ControlledRadioGroup: FC<ControlledRadioGroupProps> = (props) => {
  // TODO: implement hint and description
  const {
    loading,
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

  const { field } = useController({ name, control });

  const [selected, setSelected] = useState<string>(
    // check if value exists in options
    options.some((option) => option.value === field.value)
      ? field.value
      : options[0].value
  );

  return (
    <FieldSet>
      <legend>{label}</legend>
      <div>
        {options.map(({ label, labelPosition, value }) => {
          return (
            <ControlledRadio
              key={`controlled-radio-option-${label}`}
              label={label}
              labelPosition={labelPosition}
              loading={loading}
              name={name}
              readOnly={readOnly}
              selected={selected === value}
              setSelected={setSelected}
              size={size}
              control={control}
              required={required}
              disabled={disabled}
              value={field.value}
              hint={hint}
              description={description}
            />
          );
        })}
      </div>
    </FieldSet>
  );
};
