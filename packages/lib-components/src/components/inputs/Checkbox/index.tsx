// TODO: Improve accessibility
import { FC, useEffect, useState } from 'react';
import {
  BackgroundContainer,
  CheckboxContainer,
  CheckMarkContainer,
  Container,
} from './style';

import { Label } from '../../../components';
import { AiOutlineCheck as Icon } from 'react-icons/ai';
import { useController } from 'react-hook-form';
import { getTransition } from '../../../helpers';

import {
  InputProps,
  defaultInputPropsFactory,
  defaultInputProps,
} from '../InputProps';
import { ErrorMessage } from '../ErrorMessage';

export interface CheckboxProps extends InputProps {
  labelPosition?: 'left' | 'right';
  onChange?: (value: boolean) => void;
}

const variants = {
  unchecked: { scale: 0, opacity: 0 },
  checked: { scale: 1 },
};

const defaultsApplier =
  defaultInputPropsFactory<CheckboxProps>(defaultInputProps);

export const Checkbox: FC<CheckboxProps> = (props) => {
  const {
    name,
    size,
    label,
    control,
    loading,
    required,
    readOnly,
    disabled,
    value,
    labelPosition,
    hint,
  } = defaultsApplier(props);

  const {
    field: checkbox,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: value,
  });

  const [isChecked, setChecked] = useState<boolean>(checkbox.value);

  function handleOnClick(): void {
    if (readOnly || disabled) {
      return;
    }
    setChecked(!isChecked);
  }

  useEffect(() => {
    checkbox.onChange(isChecked);
    if (props.onChange) props.onChange(isChecked);
  }, [isChecked]);

  if (loading) {
    return (
      <Container>
        {/* CASE: Show label before <CheckBox /> */}
        {labelPosition === 'left' && label && (
          <Label
            error={!!error}
            position={labelPosition}
            size={size}
            text={label}
            disabled={disabled}
            required={required}
            hint={hint}
            htmlFor={name}
            onClick={handleOnClick}
          />
        )}
        <CheckboxContainer
          className="placeholder"
          isChecked={isChecked}
          readOnly={readOnly}
          error={!!error}
          disabled={disabled}
        />
        {/* CASE: show label after <CheckBox /> */}
        {labelPosition === 'right' && label && (
          <Label
            error={!!error}
            position={labelPosition}
            size={size}
            text={label}
            disabled={disabled}
            required={required}
            hint={hint}
            htmlFor={name}
            onClick={handleOnClick}
          />
        )}
      </Container>
    );
  }

  return (
    <Container>
      {/* CASE: Show label before <CheckBox /> */}
      {labelPosition === 'left' && label && (
        <Label
          error={!!error}
          position={labelPosition}
          size={size}
          text={label}
          disabled={disabled}
          required={required}
          htmlFor={name}
          onClick={handleOnClick}
        />
      )}
      <CheckboxContainer
        isChecked={isChecked}
        onClick={handleOnClick}
        readOnly={readOnly}
        error={!!error}
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
      {/* CASE: show label after <CheckBox /> */}
      {labelPosition === 'right' && label && (
        <Label
          error={!!error}
          position={labelPosition}
          text={label}
          disabled={disabled}
          required={required}
          htmlFor={name}
          onClick={handleOnClick}
          size={size}
        />
      )}
      {error && <ErrorMessage message={error.message!} />}
    </Container>
  );
};
