import { forwardRef, useRef } from 'react';
import { BackgroundContainer, CheckboxContainer, CheckMarkContainer } from './style';

import { AiOutlineCheck as Icon } from 'react-icons/ai';

import { defaultInputPropsFactory, defaultInputProps, GenericInputProps } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

const variants = {
  unchecked: { scale: 0, opacity: 0 },
  checked: { scale: 1, opacity: 1 },
};

export type GenericCheckBoxProps = GenericInputProps<boolean, HTMLInputElement>;

const defaultsApplier = defaultInputPropsFactory<GenericCheckBoxProps>(defaultInputProps);

// TODO: write a test that checks if the value is being processed as a boolean.
export const GenericCheckBox = forwardRef<HTMLButtonElement, GenericCheckBoxProps>(
  function GenericCheckBox(props, ref) {
    const {
      readOnly,
      disabled,
      value = false,
      hasError,
      onChange,
      id,
      name,
      hasDescription,
      size,
      required,
    } = defaultsApplier(props);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleOnClick(): void {
      if (readOnly || disabled) return;
      inputRef.current?.click();
    }

    function getIconSize() {
      switch (size) {
        case 'tiny':
          return 16;
        case 'small':
          return 14;
        case 'medium':
          return 16;
        case 'large':
          return 18;
        case 'huge':
          return 20;
      }
    }

    return (
      <>
        <input
          type="checkbox"
          aria-required={required}
          aria-hidden="true"
          style={{ position: 'absolute', pointerEvents: 'none', opacity: 0, margin: 0 }}
          checked={value}
          tabIndex={-1}
          id={`${id}-hidden-input`}
          onChange={(e) => {
            onChange(e);
          }}
          ref={inputRef}
        />
        <CheckboxContainer
          role="checkbox"
          id={id}
          isChecked={value}
          readOnly={readOnly}
          disabled={disabled}
          onClick={handleOnClick}
          aria-describedby={setAriaDescribedBy(name, hasDescription)}
          aria-checked={value}
          hasError={hasError}
          ref={ref}
          tabIndex={readOnly || disabled ? -1 : 0}
          type="button"
        >
          <BackgroundContainer
            $size={size}
            initial={value ? 'checked' : 'unchecked'}
            animate={value ? 'checked' : 'unchecked'}
            variants={variants}
          >
            <CheckMarkContainer isChecked={value}>
              <Icon size={getIconSize()} />
            </CheckMarkContainer>
          </BackgroundContainer>
        </CheckboxContainer>
      </>
    );
  },
);
