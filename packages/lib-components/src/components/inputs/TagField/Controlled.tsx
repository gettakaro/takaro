import { FC, useState } from 'react';
import { useController } from 'react-hook-form';
import { TagFieldProps, GenericTagField } from '.';
import { Label, ErrorMessage } from '../../../components';
import { Container, TagsContainer } from './style';
import {
  ControlledInputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';

export type ControlledTagFieldProps = TagFieldProps & ControlledInputProps;

const defaultsApplier =
  defaultInputPropsFactory<ControlledTagFieldProps>(defaultInputProps);

export const ControlledTagField: FC<ControlledTagFieldProps> = (props) => {
  const {
    loading,
    label,
    hint,
    disabled,
    required,
    description,
    placeholder,
    name,
    size,
    readOnly,
    control,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [showError, setShowError] = useState<boolean>(false);

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(false);
  };

  const handleOnFocus = () => {};

  if (loading) {
    return (
      <Container>
        {label && (
          <Label
            required={required}
            htmlFor={name}
            error={!!error}
            size={size}
            disabled={disabled}
            text={label}
            position="top"
          />
        )}
        <TagsContainer className="placeholder" />
      </Container>
    );
  }

  return (
    <Container>
      {label && (
        <Label
          text={label}
          htmlFor={name}
          error={false}
          disabled={disabled}
          required={required}
          position="top"
          size="medium"
          hint={hint}
        />
      )}

      <GenericTagField
        readOnly={readOnly}
        size={size}
        name={name}
        ref={field.ref}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        onChange={field.onChange}
        placeholder={placeholder}
        hasError={!!error}
        value={field.value as string[]}
      />
      {description && <p>{description}</p>}
      {error && error.message && showError && (
        <ErrorMessage message={error.message} />
      )}
    </Container>
  );
};
