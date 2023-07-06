import { ChangeEvent, FC } from 'react';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { GenericRadio } from './Radio';
import { Container } from './style';
import { Label } from '../../../components';
import { setAriaDescribedBy } from '../layout';

export interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}

export interface RadioGroupProps extends GenericInputProps<string, HTMLDivElement> {
  options: Option[];
}

const defaultsApplier = defaultInputPropsFactory<RadioGroupProps>(defaultInputProps);

// TODO: implement hint and description
export const GenericRadioGroup: FC<RadioGroupProps> = (props) => {
  const {
    readOnly,
    value: selectedValue,
    name,
    size,
    options,
    required,
    onChange,
    onBlur,
    hasError,
    hasDescription,
    disabled,
    onFocus,
    id,
  } = defaultsApplier(props);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return;
    onChange(e);
  };

  return (
    <>
      {options.map(({ label, value, labelPosition }) => {
        return (
          <Container role="radiogroup" aria-describedby={setAriaDescribedBy(name, hasDescription)}>
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
              value={value as string}
              checked={selectedValue === value}
              size={size}
              required={required}
              disabled={disabled}
              hasError={hasError}
              hasDescription={hasDescription}
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
