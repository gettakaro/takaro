import { forwardRef, useRef } from 'react';
import { BackgroundContainer, CheckboxContainer, CheckMarkContainer } from './style';

import { AiOutlineCheck as Icon } from 'react-icons/ai';
import { getTransition } from '../../../helpers';

import { defaultInputPropsFactory, defaultInputProps, GenericInputProps } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

const variants = {
  unchecked: { scale: 0, opacity: 0 },
  checked: { scale: 1, opacity: 1 },
};

export type GenericCheckBoxProps = GenericInputProps<boolean, HTMLInputElement>;

const defaultsApplier = defaultInputPropsFactory<GenericCheckBoxProps>(defaultInputProps);

// TODO: write a test that checks if the value is being processed as a boolean.
export const GenericCheckBox = forwardRef<HTMLDivElement, GenericCheckBoxProps>((props, ref) => {
  const { readOnly, disabled, value: isChecked, hasError, onChange, id, name, hasDescription } = defaultsApplier(props);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOnClick(): void {
    if (readOnly || disabled) return;

    console.log('this fired');
    inputRef.current?.click();
  }

  return (
    <>
      <input
        type="checkbox"
        aria-hidden="true"
        style={{ position: 'absolute', pointerEvents: 'none', opacity: 0, margin: 0 }}
        checked={isChecked}
        tabIndex={-1}
        value="on"
        onChange={(e) => onChange(e)}
        ref={inputRef}
      />
      <CheckboxContainer
        id={id}
        isChecked={isChecked}
        onClick={handleOnClick}
        readOnly={readOnly}
        error={hasError}
        disabled={disabled}
        ref={ref}
        role="checkbox"
        aria-checked={isChecked}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        tabIndex={readOnly || disabled ? -1 : 0}
      >
        <BackgroundContainer
          animate={isChecked ? 'checked' : 'unchecked'}
          transition={getTransition()}
          variants={variants}
          layout
        >
          <CheckMarkContainer isChecked={isChecked}>
            <Icon size={15} />
          </CheckMarkContainer>
        </BackgroundContainer>
      </CheckboxContainer>
    </>
  );
});
