import { ChangeEvent, forwardRef } from 'react';
import { Input } from './style';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';

export type GenericSwitchProps = GenericInputProps<boolean, HTMLInputElement>;

const defaultsApplier = defaultInputPropsFactory<GenericSwitchProps>(defaultInputProps);

export const GenericSwitch = forwardRef<HTMLInputElement, GenericSwitchProps>(function Switch(props, ref) {
  const {
    readOnly,
    onChange,
    value: isChecked = false,
    id,
    hasDescription,
    name,
    disabled,
    hasError,
  } = defaultsApplier(props);

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    if (disabled || readOnly) return;
    onChange(e);
  }

  return (
    <Input
      name={name}
      hasError={hasError}
      hasDescription={hasDescription}
      readOnly={readOnly}
      disabled={disabled}
      type="checkbox"
      checked={isChecked}
      id={id}
      onChange={handleOnChange}
      ref={ref}
    />
  );
});
