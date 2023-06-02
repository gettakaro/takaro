import { FC, useState } from 'react';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputProps,
} from '../InputProps';
import { GenericRadio } from './Radio';
import { FieldSet } from './style';

export interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}

export interface RadioGroupProps extends GenericInputProps {
  options: Option[];
}

const defaultsApplier =
  defaultInputPropsFactory<RadioGroupProps>(defaultInputProps);

export const GenericRadioGroup: FC<RadioGroupProps> = (props) => {
  // TODO: implement hint and description
  const {
    loading,
    readOnly,
    value,
    name,
    size,
    label,
    options,
    required,
    onChange,
    onBlur,
    error,
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
            <GenericRadio
              onChange={onChange}
              onBlur={onBlur}
              error={error}
              label={label}
              labelPosition={labelPosition}
              loading={loading}
              name={name}
              readOnly={readOnly}
              selected={selected === value}
              setSelected={setSelected}
              value={value}
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
