import { FC, useState, useEffect } from 'react';
import { useController } from 'react-hook-form';
import { Option } from '.';
import { ControlledInputProps, defaultInputProps, defaultInputPropsFactory } from '../InputProps';
import { Container, FieldSet } from './style';
import { GenericRadio } from './Radio';
import { InputWrapper, ErrorMessage, Label, Description } from '../layout';

export interface ControlledRadioGroupProps extends ControlledInputProps {
  options: Option[];
}

const defaultsApplier = defaultInputPropsFactory<ControlledRadioGroupProps>(defaultInputProps);

export const ControlledRadioGroup: FC<ControlledRadioGroupProps> = (props) => {
  const { readOnly, name, size, label, options, control, required, disabled, hint, description } =
    defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [showError, setShowError] = useState<boolean>(false);

  const handleOnFocus = () => {
    setShowError(true);
  };

  const handleOnBlur = () => {
    setShowError(false);
    field.onBlur();
  };

  useEffect(() => {
    // if suddenly the error is set, show it
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const [selected, setSelected] = useState<string>('');

  const handleChange = (val: string) => {
    if (readOnly || disabled) return;
    setSelected(val);
    field.onChange(val);
  };

  // TODO: implement loading state

  return (
    <FieldSet>
      <legend>{label}</legend>
      <InputWrapper>
        {options.map(({ label, labelPosition, value }) => {
          return (
            <Container key={`radiogroup-container-${name}-${value}`} onClick={() => handleChange(value)}>
              {label && labelPosition === 'left' && (
                <Label
                  key={`radiogroup-label-${name}-${value}`}
                  htmlFor={name}
                  text={label}
                  required={required}
                  position={labelPosition}
                  size={size}
                  error={!!error}
                  disabled={disabled}
                  hint={hint}
                  onClick={() => handleChange(value)}
                />
              )}
              <GenericRadio
                key={`radiogroup-radio-${name}-${value}`}
                hasError={!!error}
                readOnly={readOnly}
                disabled={disabled}
                required={required}
                name={name}
                id={name}
                value={value}
                checked={selected === value}
                onChange={field.onChange}
                size={size}
                onBlur={handleOnBlur}
                onFocus={handleOnFocus}
                ref={field.ref}
                hasDescription={!!description}
              />

              {label && labelPosition === 'right' && (
                <Label
                  key={`radiogroup-label-${name}-${value}`}
                  htmlFor={name}
                  position={labelPosition}
                  required={required}
                  error={!!error}
                  text={label}
                  size={size}
                  disabled={disabled}
                  hint={hint}
                  onClick={() => handleChange(value)}
                />
              )}
            </Container>
          );
        })}
        {error && showError && error.message && <ErrorMessage message={error.message} />}
      </InputWrapper>
      {description && <Description description={description} inputName={name} />}
    </FieldSet>
  );
};
