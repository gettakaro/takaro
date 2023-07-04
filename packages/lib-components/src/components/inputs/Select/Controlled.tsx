import { FC, PropsWithChildren, useState } from 'react';
import { useController } from 'react-hook-form';
import { Container } from './style';
import { ControlledInputProps, defaultInputPropsFactory, defaultInputProps } from '../InputProps';
import { GenericSelect, SubComponentTypes } from '.';
import { SelectProps } from './Generic';
import { Option } from './Generic/Option';
import { OptionGroup } from './Generic/OptionGroup';
import { ErrorMessage, Label, Wrapper, Description } from '../layout';

export type ControlledSelectProps = PropsWithChildren<ControlledInputProps & SelectProps>;

const defaultsApplier = defaultInputPropsFactory<ControlledSelectProps>(defaultInputProps);

// TODO: handle select loading state
export const ControlledSelect: FC<ControlledSelectProps> & SubComponentTypes = (props) => {
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
    minWidth,
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
    <Wrapper>
      <Container minWidth={minWidth}>
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
          hasDescription={!!description}
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
        {error && error.message && showError && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </Wrapper>
  );
};

ControlledSelect.OptionGroup = OptionGroup;
ControlledSelect.Option = Option;
