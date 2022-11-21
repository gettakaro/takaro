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
import { Size } from 'styled';
import { FormProps } from '../FormProps';

export interface CheckboxProps extends FormProps {
  name: string;
  defaultValue?: boolean;
  readOnly?: boolean;
  labelPosition?: 'left' | 'right';
  size: Size;
  required: boolean;
}

const variants = {
  checked: { scale: 1 },
  unchecked: { scale: 0, opacity: 0 },
};

export const Checkbox: FC<CheckboxProps> = ({
  control,
  defaultValue = false,
  readOnly = false,
  label,
  labelPosition = 'right',
  name,
  loading = false,
  size = 'medium',
  required,
}) => {
  const { field: checkbox } = useController({
    name,
    control,
    defaultValue: defaultValue,
  });
  const [isChecked, setChecked] = useState<boolean>(defaultValue);

  function handleOnClick(): void {
    if (readOnly) {
      return;
    }
    setChecked(!isChecked);
  }

  useEffect(() => {
    checkbox.onChange(isChecked);
  }, [isChecked]);

  if (loading) {
    return (
      <Container>
        {/* CASE: Show label before <CheckBox /> */}
        {labelPosition === 'left' && label && (
          <Label
            error={false}
            position={labelPosition}
            size={size}
            text={label}
            required={required}
          />
        )}
        <CheckboxContainer
          className="placeholder"
          isChecked={isChecked}
          readOnly={readOnly}
        />
        {/* CASE: show label after <CheckBox /> */}
        {labelPosition === 'right' && label && (
          <Label
            error={false}
            position={labelPosition}
            text={label}
            size={size}
            required={required}
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
          error={false}
          position={labelPosition}
          size={size}
          text={label}
          required={required}
          onClick={handleOnClick}
        />
      )}
      <CheckboxContainer
        isChecked={isChecked}
        onClick={handleOnClick}
        readOnly={readOnly}
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
          error={false}
          position={labelPosition}
          text={label}
          required={required}
          size={size}
        />
      )}
    </Container>
  );
};
