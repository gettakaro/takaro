import { getTransition } from '../../../../helpers';
import { Dispatch, forwardRef, SetStateAction } from 'react';
import { RadioContainer, Inner } from './style';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputPropsFunctionHandlers,
} from '../../InputProps';

export interface RadioProps {
  selected: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
  defaultSelected?: boolean;
  value: string;
}

type GenericRadioProps = GenericInputPropsFunctionHandlers<
  string,
  HTMLDivElement
> &
  RadioProps;

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 },
};

const defaultsApplier =
  defaultInputPropsFactory<GenericRadioProps>(defaultInputProps);

// TODO: add keyboard support

// make this forwardref
export const GenericRadio = forwardRef<HTMLDivElement, GenericRadioProps>(
  (props, ref) => {
    const {
      readOnly,
      value,
      selected,
      setSelected,
      onChange,
      onBlur,
      hasError,
      onFocus,
      disabled,
    } = defaultsApplier(props);

    const handleOnClick = () => {
      if (readOnly || disabled) return;
      setSelected(value as string);
      onChange(value);
    };

    return (
      <RadioContainer
        isSelected={selected}
        onClick={handleOnClick}
        readOnly={readOnly}
        onBlur={onBlur}
        onFocus={onFocus}
        isError={hasError}
        tabIndex={readOnly || disabled ? -1 : 0}
        role="radio"
        ref={ref}
      >
        <Inner
          animate={selected ? 'selected' : 'deselected'}
          isSelected={selected}
          readOnly={readOnly}
          isError={hasError}
          transition={getTransition()}
          variants={variants}
        />
      </RadioContainer>
    );
  }
);
