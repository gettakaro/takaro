import { FC, useState } from 'react';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputProps,
} from '../InputProps';
import { GenericRadio } from './Radio';

export interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}

export interface RadioGroupProps extends GenericInputProps<HTMLDivElement> {
  options: Option[];
}

const defaultsApplier =
  defaultInputPropsFactory<RadioGroupProps>(defaultInputProps);

// TODO: implement hint and description
export const GenericRadioGroup: FC<RadioGroupProps> = (props) => {
  const {
    readOnly,
    value,
    name,
    size,
    options,
    required,
    onChange,
    onBlur,
    hasError,
    disabled,
    onFocus,
  } = defaultsApplier(props);

  const [selected, setSelected] = useState<string>(
    // check if value exists in options
    options.some((option) => option.value === value)
      ? (value as string)
      : options[0].value
  );

  return (
    <>
      {options.map(({ label, value }) => (
        <GenericRadio
          key={`radio-option-${label}-${name}`}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          name={name}
          readOnly={readOnly}
          selected={selected === value}
          setSelected={setSelected}
          value={value as string}
          size={size}
          required={required}
          disabled={disabled}
          hasError={hasError}
        />
      ))}
    </>
  );
};
