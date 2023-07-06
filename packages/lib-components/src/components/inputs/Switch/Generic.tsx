import { forwardRef, useRef } from 'react';
import { getTransition } from '../../../helpers';
import { Dot, ContentContainer } from './style';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

export type GenericSwitchProps = GenericInputProps<boolean, HTMLInputElement>;

const defaultsApplier = defaultInputPropsFactory<GenericSwitchProps>(defaultInputProps);

export const GenericSwitch = forwardRef<HTMLButtonElement, GenericSwitchProps>((props, ref) => {
  const { readOnly, onChange, value: isChecked, id, hasDescription, name, disabled, hasError } = defaultsApplier(props);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOnClick(): void {
    if (readOnly || disabled) return;
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
        id={`${id}-hidden-input`}
        value="on"
        onChange={(e) => onChange(e)}
        ref={inputRef}
      />
      <ContentContainer
        role="switch"
        id={id}
        isChecked={isChecked}
        disabled={disabled}
        onClick={handleOnClick}
        ref={ref}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        aria-checked={isChecked}
        hasError={hasError}
        tabIndex={readOnly || disabled ? -1 : 0}
        type="button"
      >
        <Dot
          animate={{ right: isChecked ? '3px' : '23px' }}
          readOnly={readOnly}
          isChecked={isChecked}
          layout
          transition={getTransition()}
        />
      </ContentContainer>
    </>
  );
});
