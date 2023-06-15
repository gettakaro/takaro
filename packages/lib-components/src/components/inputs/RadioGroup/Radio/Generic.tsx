import { getTransition } from '../../../../helpers';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { RadioContainer, Inner } from './style';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputProps,
} from '../../InputProps';
import { GenericHandlers } from '.';

export interface RadioProps {
  selected: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
  defaultSelected?: boolean;
  value: string;
}

type GenericRadioProps = GenericInputProps<HTMLDivElement> &
  RadioProps &
  GenericHandlers;

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 },
};

const defaultsApplier =
  defaultInputPropsFactory<GenericRadioProps>(defaultInputProps);

export const GenericRadio: FC<GenericRadioProps> = (props) => {
  const {
    readOnly,
    value,
    selected,
    setSelected,
    onChange,
    onBlur,
    onFocus,
    disabled,
  } = defaultsApplier(props);

  const handleOnClick = () => {
    if (readOnly || disabled) return;
    setSelected(value as string);
  };

  useEffect(() => {
    if (selected && !readOnly) {
      onChange(value);
    }
  }, [selected]);

  return (
    <RadioContainer
      isSelected={selected}
      onClick={handleOnClick}
      readOnly={readOnly}
      onBlur={onBlur}
      onFocus={onFocus}
    >
      <Inner
        animate={selected ? 'selected' : 'deselected'}
        isSelected={selected}
        readOnly={readOnly}
        transition={getTransition()}
        variants={variants}
      />
    </RadioContainer>
  );
};
