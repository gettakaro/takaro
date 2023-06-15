// TODO: Improve accessibility
import { FC, useEffect, useState } from 'react';

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
  GenericInputProps,
} from '../InputProps';

const variants = {
  unchecked: { scale: 0, opacity: 0 },
  checked: { scale: 1 },
};

export type GenericCheckBoxProps = GenericInputProps<HTMLDivElement>;

const defaultsApplier =
  defaultInputPropsFactory<GenericCheckBoxProps>(defaultInputProps);

export const GenericCheckBox: FC<GenericCheckBoxProps> = (props) => {
  const { readOnly, disabled, value, hasError, onChange } =
    defaultsApplier(props);

  const [isChecked, setChecked] = useState<boolean>(value as boolean);

  function handleOnClick(): void {
    if (readOnly || disabled) {
      return;
    }
    setChecked(!isChecked);
  }

  useEffect(() => {
    onChange(isChecked);
    if (props.onChange) props.onChange(isChecked);
  }, [isChecked]);

  return (
    <CheckboxContainer
      isChecked={isChecked}
      onClick={handleOnClick}
      readOnly={readOnly}
      error={hasError}
      disabled={disabled}
    >
      <BackgroundContainer
        animate={isChecked ? 'checked' : 'unchecked'}
        transition={getTransition()}
        variants={variants}
      />
      <CheckMarkContainer isChecked={isChecked}>
        <Icon size={18} />
      </CheckMarkContainer>
    </CheckboxContainer>
  );
};
