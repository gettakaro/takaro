import { FC, PropsWithChildren, useState } from 'react';
import { useController } from 'react-hook-form';
import { LoadingContainer } from './style';
import { Container } from '../sharedStyle';
import { ControlledInputProps, defaultInputPropsFactory, defaultInputProps } from '../../InputProps';
import { GenericSelectField } from '.';
import { SelectFieldProps } from './Generic';
import { Option, OptionGroup, SubComponentTypes } from '../SubComponents';
import { ErrorMessage, Label, InputWrapper, Description } from '../../layout';
import { Skeleton } from '../../../../components';

export type ControlledSelectFieldProps = PropsWithChildren<ControlledInputProps & SelectFieldProps>;

const defaultsApplier = defaultInputPropsFactory<ControlledSelectFieldProps>(defaultInputProps);

export const ControlledSelectField: FC<ControlledSelectFieldProps> & SubComponentTypes = (props) => {
  // In most cases we don't want to set default values here, but rather in the generic component.
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
    multiple,
    name,
    control,
    loading,
    enableFilter,
    inPortal,
    canClear,
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

  if (loading) {
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
          <LoadingContainer>
            <div>
              <Skeleton variant="rectangular" width="100%" height="38px" />
            </div>
          </LoadingContainer>
        </Container>
        {description && <Description description={description} inputName={name} />}
      </InputWrapper>
    );
  }

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

        {/* Typescript cannot infer the correct types here*/}
        {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <GenericSelectField
          name={name}
          id={name}
          hasError={!!error}
          hasDescription={!!description}
          readOnly={readOnly}
          canClear={canClear}
          disabled={disabled}
          required={required}
          size={componentSize}
          enableFilter={enableFilter}
          multiple={multiple}
          onChange={field.onChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          render={render}
          value={field.value}
          inPortal={inPortal}
        >
          {children}
        </GenericSelectField>
        {error && error.message && showError && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};

ControlledSelectField.OptionGroup = OptionGroup;
ControlledSelectField.Option = Option;
