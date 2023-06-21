import { FC, useState } from 'react';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputPropsFunctionHandlers,
} from '../InputProps';
import { GenericRadio } from './Radio';
import { Container } from './style';
import { Label } from '../../../components';

export interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}

export interface RadioGroupProps
  extends GenericInputPropsFunctionHandlers<string, HTMLDivElement> {
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
    id,
  } = defaultsApplier(props);

  const [selected, setSelected] = useState<string>(
    // check if value exists in options
    options.some((option) => option.value === value)
      ? (value as string)
      : options[0].value
  );

  const handleChange = (val: string) => {
    if (readOnly || disabled) return;
    setSelected(val);
    onChange(val);
  };

  return (
    <>
      {options.map(({ label, value, labelPosition }) => {
        return (
          <Container
            isSelected={value === selected}
            onClick={() => handleChange(value)}
            role="radiogroup"
          >
            {label && labelPosition === 'left' && (
              <Label
                htmlFor={name}
                text={label}
                required={required}
                position={labelPosition}
                size={size}
                error={hasError}
                disabled={disabled}
              />
            )}
            <GenericRadio
              id={id}
              key={`radio-option-${label}-${name}`}
              onChange={handleChange}
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
            {label && labelPosition === 'right' && (
              <Label
                htmlFor={name}
                text={label}
                required={required}
                position={labelPosition}
                size={size}
                error={hasError}
                disabled={disabled}
              />
            )}
          </Container>
        );
      })}
    </>
  );
};
