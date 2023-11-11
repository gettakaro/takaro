import { FC, PropsWithChildren, useState } from 'react';
import { useController } from 'react-hook-form';
import { Container } from './style';
import { ControlledInputProps, defaultInputPropsFactory, defaultInputProps } from '../InputProps';
import { SubComponentTypes } from '.';
import { GenericSearchField, SearchFieldProps } from './Generic';
import { OptionGroup } from '../Select/Generic/OptionGroup';
import { ErrorMessage, Label, Wrapper, Description } from '../layout';
import { Option } from './Generic/Option';

export type ControlledSearchFieldProps = PropsWithChildren<ControlledInputProps & SearchFieldProps>;

const defaultsApplier = defaultInputPropsFactory<ControlledSearchFieldProps>(defaultInputProps);

export const ControlledSearchField: FC<ControlledSearchFieldProps> & SubComponentTypes = (props) => {
  const {
    required,
    size: componentSize,
    label,
    children,
    placeholder,
    readOnly,
    disabled,
    hint,
    description,
    // TODO: form loading
    name,
    control,
    debounce,
    isLoadingData,
    handleInputValueChange,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [showError, setShowError] = useState<boolean>(true);

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(true);
  };

  const handleOnFocus = () => {
    setShowError(false);
  };

  return (
    <Wrapper>
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
        <GenericSearchField
          name={name}
          id={name}
          isLoadingData={isLoadingData}
          hasError={!!error}
          placeholder={placeholder}
          hasDescription={!!description}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          size={componentSize}
          onChange={field.onChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          value={field.value}
          debounce={debounce}
          handleInputValueChange={handleInputValueChange}
        >
          {children}
        </GenericSearchField>
        {error && error.message && showError && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </Wrapper>
  );
};

ControlledSearchField.OptionGroup = OptionGroup;
ControlledSearchField.Option = Option;
