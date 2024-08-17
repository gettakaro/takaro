import { cloneElement, useState, ChangeEvent, ReactElement, forwardRef } from 'react';
import { InputContainer, Input, PrefixContainer, SuffixContainer } from './style';

import { Size } from '../../../styled';
import { AiOutlineEye as ShowPasswordIcon, AiOutlineEyeInvisible as HidePasswordIcon } from 'react-icons/ai';
import { getFieldType, getInputMode } from './util';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

export function isNumber(value: unknown) {
  const number = Number(value);
  return !isNaN(number) && isFinite(number);
}

export type TextFieldType = 'text' | 'password' | 'email' | 'number';

export interface TextFieldProps {
  type?: TextFieldType;
  placeholder?: string;
  size?: Size;
  prefix?: string;
  suffix?: string | ReactElement;
  icon?: ReactElement;
}

export type GenericTextFieldProps = GenericInputProps<string, HTMLInputElement> & TextFieldProps;

const defaultsApplier = defaultInputPropsFactory<GenericTextFieldProps>(defaultInputProps);

export const GenericTextField = forwardRef<HTMLInputElement, GenericTextFieldProps>(
  function GenericTextField(props, ref) {
    const {
      onChange,
      onBlur = () => {},
      onFocus = () => {},
      name,
      disabled,
      required,
      readOnly,
      hasError,
      placeholder,
      icon,
      type = 'text',
      prefix,
      suffix,
      value,
      id,
      hasDescription,
    } = defaultsApplier(props);

    const [showPassword, setShowPassword] = useState(false);

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
      // not a perfect solution, but works for now
      if (type === 'number') {
        if (isNumber(e.target.value) || e.target.value === '-') {
          onChange(e);
        }
      } else {
        onChange(e);
      }
    };

    return (
      <InputContainer>
        {prefix && <PrefixContainer hasError={hasError}>{prefix}</PrefixContainer>}
        {icon && cloneElement(icon, { size: 18, className: 'icon' })}
        <Input
          autoCapitalize="off"
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          hasError={hasError}
          hasIcon={!!icon}
          hasPrefix={!!prefix}
          hasSuffix={!!suffix}
          isPassword={type === 'password'}
          id={id}
          name={name}
          onChange={handleOnChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          role="presentation"
          inputMode={getInputMode(type)}
          type={getFieldType(type, showPassword)}
          ref={ref}
          value={value}
          aria-readonly={readOnly}
          aria-required={required}
          aria-describedby={setAriaDescribedBy(name, hasDescription)}
        />
        {type === 'password' &&
          (showPassword ? (
            <HidePasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(false);
              }}
              size={18}
            />
          ) : (
            <ShowPasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(true);
              }}
              size={18}
            />
          ))}
        {suffix && <SuffixContainer hasError={hasError}>{suffix}</SuffixContainer>}
      </InputContainer>
    );
  },
);
