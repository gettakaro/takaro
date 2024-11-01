import { FC, PropsWithChildren, useState } from 'react';
import { useController } from 'react-hook-form';
import { ControlledInputProps, defaultInputPropsFactory, defaultInputProps } from '../../InputProps';
import { GenericSelectQueryField, SelectQueryFieldProps } from './Generic';
import { Option, OptionGroup, SubComponentTypes } from '../SubComponents';
import { ErrorMessage, Label, InputWrapper, Description } from '../../layout';
import { Container } from '../sharedStyle';

export type ControlledSelectQueryFieldProps = PropsWithChildren<SelectQueryFieldProps & ControlledInputProps>;

const defaultsApplier = defaultInputPropsFactory<ControlledSelectQueryFieldProps>(defaultInputProps);

export const ControlledSelectQueryField: FC<ControlledSelectQueryFieldProps> & SubComponentTypes = (props) => {
  const {
    required,
    size: componentSize,
    label,
    children,
    placeholder,
    readOnly,
    render,
    disabled,
    hint,
    description,
    canClear,
    name,
    multiple,
    control,
    debounce,
    isLoadingData,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    optionCount,
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
    <InputWrapper>
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
        <GenericSelectQueryField
          name={name}
          id={name}
          isLoadingData={isLoadingData}
          hasError={!!error}
          placeholder={placeholder}
          hasDescription={!!description}
          readOnly={readOnly}
          render={render}
          disabled={disabled}
          multiple={multiple}
          required={required}
          size={componentSize}
          onChange={field.onChange}
          onBlur={handleOnBlur}
          canClear={canClear}
          onFocus={handleOnFocus}
          value={field.value}
          debounce={debounce}
          optionCount={optionCount}
          handleInputValueChange={handleInputValueChange}
          isFetching={isFetching}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        >
          {children}
        </GenericSelectQueryField>
        {error && error.message && showError && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};

ControlledSelectQueryField.OptionGroup = OptionGroup;
ControlledSelectQueryField.Option = Option;
