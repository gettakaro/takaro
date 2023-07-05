import { forwardRef, useRef } from 'react';
import { getTransition } from '../../../helpers';
import { Dot, ContentContainer } from './style';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

export type GenericSwitchProps = GenericInputProps<boolean, HTMLInputElement>;

const defaultsApplier = defaultInputPropsFactory<GenericSwitchProps>(defaultInputProps);

export const GenericSwitch = forwardRef<HTMLButtonElement, GenericSwitchProps>((props, ref) => {
  const { readOnly, onChange, value: isChecked, id, hasDescription, name } = defaultsApplier(props);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOnClick(): void {
    inputRef.current?.click();
  }

  return (
    <>
      <input
        type="checkbox"
        aria-hidden="true"
        style={{ display: 'none' }}
        checked={isChecked}
        tabIndex={-1}
        value="on"
        onChange={(e) => onChange(e)}
        ref={inputRef}
      />
      <ContentContainer
        role="switch"
        onClick={handleOnClick}
        ref={ref}
        id={id}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        aria-checked={isChecked}
        isChecked={isChecked}
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
