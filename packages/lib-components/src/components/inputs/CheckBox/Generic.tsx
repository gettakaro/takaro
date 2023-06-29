import { useEffect, useState, forwardRef } from 'react';
import {
  BackgroundContainer,
  CheckboxContainer,
  CheckMarkContainer,
} from './style';

import { AiOutlineCheck as Icon } from 'react-icons/ai';
import { getTransition } from '../../../helpers';

import {
  defaultInputPropsFactory,
  defaultInputProps,
  GenericInputPropsFunctionHandlers,
} from '../InputProps';
import { setAriaDescribedBy } from '../layout';

const variants = {
  unchecked: { scale: 0, opacity: 0 },
  checked: { scale: 1, opacity: 1 },
};

export type GenericCheckBoxProps = GenericInputPropsFunctionHandlers<
  boolean,
  HTMLDivElement
> & { value: boolean };

const defaultsApplier =
  defaultInputPropsFactory<GenericCheckBoxProps>(defaultInputProps);

// TODO: write a test that checks if the value is being processed as a boolean.
export const GenericCheckBox = forwardRef<HTMLDivElement, GenericCheckBoxProps>(
  (props, ref) => {
    const {
      readOnly,
      disabled,
      value,
      hasError,
      onChange,
      id,
      name,
      hasDescription,
    } = defaultsApplier(props);

    const [isChecked, setChecked] = useState<boolean>(Boolean(value));

    function handleOnClick(): void {
      if (readOnly || disabled) {
        return;
      }
      setChecked(!isChecked);
    }

    useEffect(() => {
      onChange(isChecked);
    }, [isChecked]);

    return (
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
        >
          <CheckMarkContainer isChecked={isChecked}>
            <Icon size={15} />
          </CheckMarkContainer>
        </BackgroundContainer>
      </CheckboxContainer>
    );
  }
);
