import { FC, PropsWithChildren, useState } from 'react';
import { useController } from 'react-hook-form';
import { Container } from './style';
import {
  ControlledInputProps,
  defaultInputPropsFactory,
  defaultInputProps,
} from '../InputProps';
import { GenericSelect, SubComponentTypes } from '.';
import { ErrorMessage, Label } from '../../../components';
import { SelectProps } from './Generic';
import { Option } from './Generic/Option';
import { OptionGroup } from './Generic/OptionGroup';

export type ControlledSelectProps = PropsWithChildren<
  ControlledInputProps & SelectProps
>;

const defaultsApplier =
  defaultInputPropsFactory<ControlledSelectProps>(defaultInputProps);

export const ControlledSelect: FC<ControlledSelectProps> & SubComponentTypes = (
  props
) => {
  const {
    required,
    size: componentSize,
    label,
    render,
    children,
    readOnly,
    disabled,
    hint,
    description,
    name,
    control,
    loading,
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

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <Container>
      {label && (
        <Label
          error={!!error}
          text={label}
          required={required}
          position="top"
          size={componentSize}
          disabled={disabled}
          hint={hint}
        />
      )}
      <GenericSelect
        name={name}
        id={name}
        hasError={!!error}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        size={componentSize}
        onChange={field.onChange}
        onBlur={handleOnBlur}
        render={render}
        value={field.value}
      >
        {children}
      </GenericSelect>
      {error && error.message && showError && (
        <ErrorMessage message={error.message} />
      )}
      <p>{description}</p>
    </Container>
  );
};

ControlledSelect.OptionGroup = OptionGroup;
ControlledSelect.Option = Option;
