import { forwardRef } from 'react';
import { TextAreaContainer, TextArea } from './style';

import { GenericInputProps, defaultInputProps, defaultInputPropsFactory } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

export interface TextAreaFieldProps {
  placeholder?: string;
  rows?: number;
}

export type GenericTextAreaFieldProps = TextAreaFieldProps & GenericInputProps<string, HTMLTextAreaElement>;

const defaultsApplier = defaultInputPropsFactory<TextAreaFieldProps & GenericInputProps<string, HTMLTextAreaElement>>(
  defaultInputProps,
);

export const GenericTextAreaField = forwardRef<HTMLTextAreaElement, GenericTextAreaFieldProps>(
  function GenericTextAreaField(props, ref) {
    const {
      disabled,
      required,
      onBlur = () => {},
      placeholder,
      onChange,
      onFocus = () => {},
      name,
      rows = 4,
      hasError,
      hasDescription,
      value,
      readOnly,
      id,
    } = defaultsApplier(props);

    return (
      <TextAreaContainer>
        <TextArea
          hasError={hasError}
          id={id}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          role="presentation"
          disabled={disabled}
          ref={ref}
          value={value}
          rows={rows}
          aria-required={required}
          aria-describedby={setAriaDescribedBy(name, hasDescription)}
        />
      </TextAreaContainer>
    );
  },
);
