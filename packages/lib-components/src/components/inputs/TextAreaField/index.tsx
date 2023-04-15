import { FC, useState, ChangeEvent } from 'react';
import { Container, TextAreaContainer, TextArea } from './style';

import { ErrorMessage } from '../ErrorMessage';
import { Label } from '../Label';
import { useController } from 'react-hook-form';

import {
  InputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';

export interface TextAreaFieldProps extends InputProps {
  readOnly?: boolean;
  placeholder?: string;
}

const defaultsApplier =
  defaultInputPropsFactory<TextAreaFieldProps>(defaultInputProps);

export const TextAreaField: FC<TextAreaFieldProps> = (props) => {
  const {
    control,
    loading,
    value,
    label,
    hint,
    disabled,
    required,
    name,
    size,
    readOnly,
    placeholder = '',
  } = defaultsApplier(props);

  const [showError, setShowError] = useState(false);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: value ?? '',
    rules: {
      required: required,
    },
  });

  const handleOnBlur = () => {
    field.onBlur();
    setShowError(false);
  };

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    field.onChange(event.target.value);
  };

  const handleOnFocus = () => {
    setShowError(true);
  };

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
        <TextAreaContainer className="placeholder" />
      </Container>
    );
  }

  return (
    <Container>
      {label && (
        <Label
          required={required}
          hint={hint}
          htmlFor={name}
          error={!!error}
          size={size}
          text={label}
          disabled={disabled}
          position="top"
        />
      )}
      <TextAreaContainer>
        <TextArea
          {...field}
          hasError={!!error}
          id={name}
          name={name}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          role="presentation"
        />
      </TextAreaContainer>
      {error && showError && <ErrorMessage message={error.message!} />}
      {props.description && <p>{props.description}</p>}
    </Container>
  );
};
