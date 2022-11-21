import { FC, useState } from 'react';
import { Control } from 'react-hook-form';
import { FormProps } from '../FormProps';
import { Radio } from './Radio';
import { FieldSet } from './style';

interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}

export interface RadioGroupProps extends FormProps {
  label: string;
  options: Option[];
  defaultValue?: string;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
  name: string;
}

export const RadioGroup: FC<RadioGroupProps> = ({
  label,
  control,
  options,
  defaultValue,
  loading,
  name,
  error,
  size,
  required,
  disabled,
  readOnly = false,
}) => {
  const [selected, setSelected] = useState<string>(
    defaultValue ? defaultValue : options[0].value
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
