import { cloneElement, createRef, FC, useEffect, useState } from 'react';
import {
  Container,
  DropDownContainer,
  SelectedContainer,
  OptionsContainer,
  IconContainer,
  Option,
  ArrowContainer,
  CheckMarkContainer
} from './style';
import { Control, FieldError, useController } from 'react-hook-form';
import { useFloating } from '@floating-ui/react-dom';
import { useOutsideAlerter } from '../../../hooks';
import { ErrorContainer, Error } from '../Field/style';
import {
  AiOutlineDown as ArrowDownIcon,
  AiOutlineUp as ArrowUpIcon,
  AiOutlineCheck as CheckMarkIcon
} from 'react-icons/ai';

import 'simplebar/dist/simplebar.min.css';
import SimpleBar from 'simplebar-react';

type OptionType = {
  value: string;
  label: string;
};

export interface SelectProps {
  options: OptionType[];
  name: string;
  control: Control<any>
  icon?: JSX.Element;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  defaultValue?: OptionType;
  error?: FieldError;
  onChange?: (value: string) => void;
}

export const Select: FC<SelectProps> = ({
  options,
  control,
  name,
  icon,
  error,
  label,
  onChange,
  readOnly = false,
  defaultValue,
  placeholder = 'select an option'
}) => {
  const {
    field: { ref, ...inputProps }
  } = useController({ name, control });

  const { x, y, strategy, reference, floating } = useFloating();
  const [showError, setShowError] = useState(false);
  const [selected, setSelected] = useState<OptionType | undefined>(defaultValue);

  const [visible, setVisible] = useState<boolean>(false);
  const parentRef = createRef<HTMLDivElement>();
  useOutsideAlerter(parentRef, () => {
    setVisible(false);
  });

  useEffect(() => {
    if (selected) {
      if (onChange) {
        onChange(selected.value);
      }
      if (inputProps) {
        inputProps.onChange(selected.value);
      }
    }
  }, [selected]);

  return (
    <Container ref={parentRef}>
      <label
        onClick={() => {
          setVisible(!visible);
        }}
      >
        {label}
      </label>
      <SelectedContainer
        className={readOnly ? 'read-only' : ''}
        hasError={error ? true : false}
        hasIcon={icon ? true : false}
        onBlur={() => setShowError(false)}
        onClick={() => setVisible(!visible)}
        onFocus={() => setShowError(true)}
        ref={reference}
      >
        <ArrowContainer>
          {visible ? <ArrowUpIcon size={18} /> : <ArrowDownIcon size={18} />}
        </ArrowContainer>
        {icon && <IconContainer>{cloneElement(icon, { size: 20 })}</IconContainer>}
        <p>{selected?.label ? selected.label : placeholder}</p>
        {/* This is here to work with react-hook-form */}
        <select {...inputProps} ref={ref}>
          {options.map(({ label, value }) => {
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      </SelectedContainer>

      {/* show dropdown with different options */}
      {visible && (
        <DropDownContainer
          ref={floating}
          style={{ left: x ?? 0, top: y ? y + 5 : 0, position: strategy }}
        >
          {/* Custom scrollbar */}
          <SimpleBar
            style={{
              maxHeight: '40vh'
            }}
          >
            <OptionsContainer>
              {options.map(({ label, value }) => (
                <Option
                  key={value}
                  onClick={(): void => {
                    setVisible(false);
                    setSelected({ value: value, label: label });
                  }}
                  selected={selected?.value === value && selected.label === label ? true : false}
                >
                  <span>{label}</span>
                  {selected?.value === value && selected.label === label && (
                    <CheckMarkContainer>
                      <CheckMarkIcon size={22} />
                    </CheckMarkContainer>
                  )}
                </Option>
              ))}
            </OptionsContainer>
          </SimpleBar>
        </DropDownContainer>
      )}
      {error && (
        <ErrorContainer showError={showError}>
          <Error>{error.message}</Error>
        </ErrorContainer>
      )}
    </Container>
  );
};
