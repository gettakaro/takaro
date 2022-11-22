import { FC, useState } from 'react';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../InputProps';
import { Radio } from './Radio';
import { FieldSet } from './style';

interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}

export interface RadioGroupProps extends InputProps {
  options: Option[];
}

const defaultsApplier =
  defaultInputPropsFactory<RadioGroupProps>(defaultInputProps);

export const RadioGroup: FC<RadioGroupProps> = (props) => {
  const {
    loading,
    control,
    readOnly,
    value,
    name,
    size,
    label,
    error,
    options,
    required,
    disabled,
  } = defaultsApplier(props);

  const [selected, setSelected] = useState<string>(
    // check if value exists in options
    options.some((option) => option.value === value)
      ? (value as string)
      : options[0].value
  );

  return (
    <FieldSet>
      <legend>{label}</legend>
      <div>
        {options.map(({ label, labelPosition, value }) => {
          return (
            <Radio
              control={control}
              label={label}
              labelPosition={labelPosition}
              loading={loading}
              name={name}
              readOnly={readOnly}
              selected={selected === value}
              setSelected={setSelected}
              value={value}
              error={error}
              size={size}
              required={required}
              disabled={disabled}
            />
          );
        })}
      </div>
    </FieldSet>
  );
};
