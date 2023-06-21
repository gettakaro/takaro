import { forwardRef } from 'react';
import { TextAreaContainer, TextArea } from './style';

import {
  GenericInputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';

export interface TextAreaFieldProps {
  placeholder?: string;
  rows?: number;
}

export type GenericTextAreaFieldProps = TextAreaFieldProps &
  GenericInputProps<HTMLTextAreaElement>;

const defaultsApplier = defaultInputPropsFactory<
  TextAreaFieldProps & GenericInputProps<HTMLTextAreaElement>
>(defaultInputProps);

export const GenericTextAreaField = forwardRef<
  HTMLTextAreaElement,
  GenericTextAreaFieldProps
>((props, ref) => {
  const {
    disabled,
    required,
    onBlur = () => {},
    placeholder,
    onChange,
    onFocus = () => {},
    name,
    rows = 5,
    hasError,
    readOnly,
  } = defaultsApplier(props);

  return (
    <TextAreaContainer>
      <TextArea
        hasError={hasError}
        id={name}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        readOnly={readOnly}
        role="presentation"
        disabled={disabled}
        required={required}
        ref={ref}
        rows={rows}
      />
    </TextAreaContainer>
  );
});
