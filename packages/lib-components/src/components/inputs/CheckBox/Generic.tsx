import { ChangeEvent, forwardRef } from 'react';
import { Input } from './style';
import { defaultInputPropsFactory, defaultInputProps, GenericInputProps } from '../InputProps';

export type GenericCheckBoxProps = GenericInputProps<boolean, HTMLInputElement>;
const defaultsApplier = defaultInputPropsFactory<GenericCheckBoxProps>(defaultInputProps);

// TODO: write a test that checks if the value is being processed as a boolean.
export const GenericCheckBox = forwardRef<HTMLInputElement, GenericCheckBoxProps>(function Switch(props, ref) {
  const {
    readOnly,
    disabled,
    value = false,
    hasError,
    onChange,
    id,
    name,
    hasDescription,
    required,
  } = defaultsApplier(props);

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    if (readOnly || disabled) return;
    onChange(e);
  }

  return (
    <Input
      name={name}
      type="checkbox"
      hasError={hasError}
      hasDescription={hasDescription}
      aria-required={required}
      checked={value}
      readOnly={readOnly}
      disabled={disabled}
      id={id}
      onChange={handleOnChange}
      ref={ref}
    />
  );
});
