import React, {
  KeyboardEvent,
  FC,
  useRef,
  useEffect,
  ChangeEvent,
} from 'react';
import {
  Container,
  InputContainer,
  Input,
  LoadingField,
  ErrorContainer,
  Error,
} from './style';
import { useController } from 'react-hook-form';
import {
  InputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';

export interface CodeFieldProps extends InputProps {
  name: string;
  fields: number;
  allowedCharacters?: RegExp;
  autoSubmit: () => unknown;
}

const defaultsApplier =
  defaultInputPropsFactory<CodeFieldProps>(defaultInputProps);

export const CodeField: FC<CodeFieldProps> = (props) => {
  const {
    error,
    loading,
    control,
    name,
    fields,
    autoSubmit,
    allowedCharacters = /[0-9]/,
  } = defaultsApplier(props);

  const {
    field: { ...inputProps },
  } = useController({ name, control });
  const fieldRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    console.log(fieldRefs.current);
    if (fieldRefs.current.length) {
      fieldRefs.current[0].focus();
    }
  }, []);

  const sendResult = () => {
    const res = fieldRefs.current.map((field) => field.value).join('');
    inputProps.onChange(res);

    if (res.length === fields) {
      if (autoSubmit) {
        autoSubmit();
      }
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      <InputContainer fields={fields}>
        {Array.from(Array(fields).keys()).map((_, i) => (
          <Input
            autoCapitalize="off"
            autoComplete="off"
            hasError={error ? true : false}
            id={`${name}-${i}`}
            maxLength={1}
            name={`${name}-${i}`}
            onChange={handleOnChange}
            onFocus={handleOnFocus}
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
      </InputContainer>
      {error && (
        <ErrorContainer>
          <Error>{error.message}</Error>
        </ErrorContainer>
      )}
    </Container>
  );
};
