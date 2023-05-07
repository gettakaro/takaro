import { FC, useState } from 'react';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../InputProps';
import { GenericRadio } from './Radio';
import { FieldSet } from './style';

interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}

export interface RadioGroupProps extends InputProps {
  options: Option[];
}

interface GenericRadioGroupProps extends RadioGroupProps {
  onChange: (...event: unknown[]) => unknown;
  onBlur: (...event: unknown[]) => unknown;
  error?: string;
}

const defaultsApplier =
  defaultInputPropsFactory<GenericRadioGroupProps>(defaultInputProps);

export const GenericRadioGroup: FC<GenericRadioGroupProps> = (props) => {
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
