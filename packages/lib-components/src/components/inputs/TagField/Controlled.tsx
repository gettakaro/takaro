import { FC } from 'react';
import { useController } from 'react-hook-form';
import { GenericTagField, TagFieldProps } from '.';
import { ControlledInputProps } from '../InputProps';

export type ControlledTagFieldProps = TagFieldProps & ControlledInputProps;

export const ControlledTagField: FC<ControlledTagFieldProps> = ({
  name,
  control,
  placeholder,
  hint,
  size,
  label,
  disabled,
  required,
  description,
  onRemoved,
  readOnly,
  onExisting,
  separators,
  isEditOnRemove,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <GenericTagField
      placeholder={placeholder}
      label={label}
      size={size}
      hint={hint}
      name={name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      loading={false}
      disabled={disabled}
      required={required}
      error={error?.message}
      ref={field.ref}
      description={description}
      onRemoved={onRemoved}
      readOnly={readOnly}
      onExisting={onExisting}
      separators={separators}
      isEditOnRemove={isEditOnRemove}
    />
  );
};
