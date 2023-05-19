import { FC } from 'react';
import { useController } from 'react-hook-form';
import { GenericTagField, TagFieldProps } from '.';

export const ControlledTagField: FC<TagFieldProps> = ({
  name,
  control,
  value,
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
  seperators,
  isEditOnRemove,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: value ?? '',
  });

  return (
    <GenericTagField
      placeholder={placeholder}
      label={label}
      size={size}
      hint={hint}
      value={value}
      control={control}
      name={name}
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
      seperators={seperators}
      isEditOnRemove={isEditOnRemove}
    />
  );
};
