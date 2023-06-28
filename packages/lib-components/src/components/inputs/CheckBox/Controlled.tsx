import { FC } from 'react';
import { useController } from 'react-hook-form';
import { GenericCheckBox } from '.';
import { Wrapper, Container, CheckboxContainer } from './style';
import { Label, ErrorMessage } from '../../../components';

import {
  defaultInputProps,
  defaultInputPropsFactory,
  ControlledInputProps,
} from '../InputProps';
import { Description } from '../layout';

export interface CheckBoxProps {
  labelPosition?: 'left' | 'right';
}

export type ControlledCheckBoxProps = ControlledInputProps & CheckBoxProps;

const defaultsApplier =
  defaultInputPropsFactory<ControlledCheckBoxProps>(defaultInputProps);

export const ControlledCheckBox: FC<ControlledCheckBoxProps> = (props) => {
  const {
    name,
    size,
    label,
    loading,
    required,
    readOnly,
    disabled,
    description,
    labelPosition = 'left',
    hint,
    control,
  } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  if (loading) {
    return (
      <Wrapper>
        <Container>
          {/* CASE: Show label before <CheckBox /> */}
          {labelPosition === 'left' && label && (
            <Label
              error={!!error}
              position={labelPosition}
              size={size}
              text={label}
              disabled={disabled}
              required={required}
              hint={hint}
              htmlFor={name}
            />
          )}
          <CheckboxContainer
            className="placeholder"
            readOnly={readOnly}
            error={!!error}
            disabled={disabled}
          />
          {/* CASE: show label after <CheckBox /> */}
          {labelPosition === 'right' && label && (
            <Label
              error={!!error}
              position={labelPosition}
              size={size}
              text={label}
              disabled={disabled}
              required={required}
              hint={hint}
              htmlFor={name}
            />
          )}
        </Container>
        {description && (
          <Description description={description} inputName={name} />
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Container>
        {/* CASE: Show label before <CheckBox /> */}
        {labelPosition === 'left' && label && (
          <Label
            error={!!error}
            position={labelPosition}
            size={size}
            text={label}
            disabled={disabled}
            required={required}
            htmlFor={name}
          />
        )}
        <GenericCheckBox
          id={name}
          name={name}
          disabled={disabled}
          size={size}
          onBlur={field.onBlur}
          readOnly={readOnly}
          hasError={!!error}
          hasDescription={!!description}
          required={required}
          onChange={field.onChange}
          value={field.value}
          ref={field.ref}
        />

        {/* CASE: show label after <CheckBox /> */}
        {labelPosition === 'right' && label && (
          <Label
            error={!!error}
            position={labelPosition}
            text={label}
            disabled={disabled}
            required={required}
            htmlFor={name}
            size={size}
          />
        )}
        {error && error.message && <ErrorMessage message={error.message} />}
      </Container>
      {description && (
        <Description description={description} inputName={name} />
      )}
    </Wrapper>
  );
};
