import { cloneElement, useState, ChangeEvent, ReactElement, forwardRef } from 'react';
import {
  InputWrapper,
  InputContainer,
  Input,
  PrefixContainer,
  SuffixContainer,
  HumanReadableCronContainer,
} from './style';
import cronstrue from 'cronstrue';

import { Size } from '../../../styled';
import { AiOutlineEye as ShowPasswordIcon, AiOutlineEyeInvisible as HidePasswordIcon } from 'react-icons/ai';
import { getFieldType, getInputMode } from './util';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

export type TextFieldType = 'text' | 'password' | 'email' | 'number' | 'cron';

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
        const value = e.target.value;
        if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
          onChange(e);
        }
      } else {
        onChange(e);
      }
    };

    const cronOutput = type === 'cron' ? showHumanReadableCron(value) : null;

    return (
      <InputWrapper>
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
        {cronOutput && (
          <HumanReadableCronContainer isError={cronOutput.isError}>{cronOutput.value}</HumanReadableCronContainer>
        )}
      </InputWrapper>
    );
  },
);

function showHumanReadableCron(cron: string) {
  if (cron === '') {
    return { value: '', isError: false };
  }

  try {
    return { value: cronstrue.toString(cron), isError: false };
  } catch (e) {
    return { value: `${e}`, isError: true };
  }
}
