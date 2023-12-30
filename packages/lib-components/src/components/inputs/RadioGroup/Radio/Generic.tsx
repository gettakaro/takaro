import { getTransition } from '../../../../helpers';
import { forwardRef, useRef } from 'react';
import { RadioContainer, Inner } from './style';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../../InputProps';

export interface RadioProps {
  checked: boolean;
}

type GenericRadioProps = GenericInputProps<string, HTMLDivElement> & RadioProps;

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 },
};

const defaultsApplier = defaultInputPropsFactory<GenericRadioProps>(defaultInputProps);

// TODO: add keyboard support

// make this forwardref
export const GenericRadio = forwardRef<HTMLDivElement, GenericRadioProps>((props, ref) => {
  const { readOnly, value, onChange, checked, onBlur, hasError, onFocus, disabled } = defaultsApplier(props);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleOnClick = () => {
    if (readOnly || disabled) return;
    inputRef.current?.click();
  };

  return (
    <>
      <input
        type="radio"
        style={{ position: 'absolute', opacity: 0, margin: 0, padding: 0, pointerEvents: 'none' }}
        aria-hidden="true"
        value={value}
        tabIndex={-1}
        checked={checked}
        onChange={(e) => onChange(e)}
        ref={inputRef}
      />
      <RadioContainer
        isSelected={checked}
        onClick={handleOnClick}
        readOnly={readOnly}
        onBlur={onBlur}
        onFocus={onFocus}
        isError={hasError}
        tabIndex={disabled ? -1 : 0}
        role="radio"
        ref={ref}
      >
        <Inner
          animate={checked ? 'selected' : 'deselected'}
          isSelected={checked}
          readOnly={readOnly}
          isError={hasError}
          transition={getTransition()}
          variants={variants}
        />
      </RadioContainer>
    </>
  );
});
