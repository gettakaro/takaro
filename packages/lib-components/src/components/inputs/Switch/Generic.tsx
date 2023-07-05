import { useEffect, useState, forwardRef } from 'react';
import { getTransition } from '../../../helpers';
import { Dot, ContentContainer } from './style';
import { defaultInputProps, defaultInputPropsFactory, GenericInputPropsFunctionHandlers } from '../InputProps';
import { setAriaDescribedBy } from '../layout';

export type GenericSwitchProps = GenericInputPropsFunctionHandlers<boolean, HTMLDivElement>;

const defaultsApplier = defaultInputPropsFactory<GenericSwitchProps>(defaultInputProps);

export const GenericSwitch = forwardRef<HTMLButtonElement, GenericSwitchProps>((props, ref) => {
  const { readOnly, onChange, value, id, hasDescription, name } = defaultsApplier(props);

  const [isChecked, setChecked] = useState<boolean>(value as boolean);

  function handleOnClick(): void {
    setChecked(!isChecked);
  }

  useEffect(() => {
    setChecked(value as boolean);
  }, [value]);

  useEffect(() => {
    onChange(isChecked);
  }, [isChecked]);

  return (
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
  );
});
