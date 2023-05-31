import React, {
  KeyboardEvent,
  FC,
  useRef,
  useEffect,
  ChangeEvent,
  useState,
} from 'react';
import { Container, InputContainer, Input, LoadingField } from './style';
import {
  InputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';
import { Label, ErrorMessage } from '../../../components';

export interface CodeFieldProps extends InputProps {
  name: string;
  fields: number;
  allowedCharacters?: RegExp;
  autoSubmit?: () => unknown;
}

interface GenericCodeFieldProps extends CodeFieldProps {
  onChange: (...event: unknown[]) => unknown;
  onBlur: (...event: unknown[]) => unknown;
  error?: string;
}

const defaultsApplier =
  defaultInputPropsFactory<GenericCodeFieldProps>(defaultInputProps);

export const GenericCodeField: FC<GenericCodeFieldProps> = (props) => {
  const {
    loading,
    name,
    fields,
    autoSubmit,
    allowedCharacters = /[0-9]/,
    hint,
    size,
    disabled,
    onChange,
    error,
    required,
    label,
  } = defaultsApplier(props);

  const [showError, setShowError] = useState<boolean>(false);

  const fieldRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (fieldRefs.current.length) {
      fieldRefs.current[0].focus();
    }
  }, []);

  const sendResult = () => {
    const res = fieldRefs.current.map((field) => field.value).join('');
    onChange(res);

    if (res.length === fields) {
      if (autoSubmit) autoSubmit();
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const {
      target: { value, nextElementSibling },
    } = e;

    if (value.match(allowedCharacters)) {
      if (nextElementSibling !== null) {
        (nextElementSibling as HTMLInputElement).focus();
      }
    } else {
      e.target.value = '';
    }
    sendResult();
  };

  const handleOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;

    setShowError(true);
    e.target.select();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    if (e.key === 'Backspace') {
      if (target.value === '' && target.previousElementSibling !== null) {
        if (target.previousElementSibling !== null) {
          (target.previousElementSibling as HTMLInputElement).focus();
          e.preventDefault();
        }
      } else {
        target.value = '';
      }
      sendResult();
    }
  };

  const handleOnBlur = () => {
    if (disabled) return;
    setShowError(false);
  };

  const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData('Text');
    if (value.match(allowedCharacters)) {
      for (let i = 0; i < fields && i < value.length; i++) {
        fieldRefs.current[i].value = value.charAt(i);
        if (fieldRefs.current[i].nextElementSibling !== null) {
          (fieldRefs.current[i].nextElementSibling as HTMLInputElement).focus();
        }
      }
      sendResult();
    }
    e.preventDefault();
  };

  if (loading) {
    return (
      <Container>
        <InputContainer fields={fields}>
          {Array.from(Array(fields).keys()).map((_, idx) => (
            <LoadingField
              key={`loading-field-array-${idx}`}
              className="placeholder"
            />
          ))}
        </InputContainer>
      </Container>
    );
  }

  return (
    <Container>
      {label && (
        <Label
          required={required}
          disabled={disabled}
          size={size}
          hint={hint}
          text={label}
          position="top"
          error={!!error}
          htmlFor={`${name}-0`}
        />
      )}
      <InputContainer fields={fields}>
        {Array.from(Array(fields).keys()).map((_, i) => (
          <Input
            autoCapitalize="off"
            autoComplete="off"
            hasError={!!error}
            isDisabled={disabled}
            disabled={disabled}
            id={`${name}-${i}`}
            maxLength={1}
            name={`${name}-${i}`}
            onChange={handleOnChange}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            onKeyDown={handleKeyDown}
            onPaste={handleOnPaste}
            ref={(el) => {
              if (el) {
                fieldRefs.current[i] = el;
              }
            }}
            type="text"
          />
        ))}
        {error && showError && <ErrorMessage message={error} />}
      </InputContainer>
    </Container>
  );
};
