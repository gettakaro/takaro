// TODO: Improve accessibility
import React, { FC, useEffect, useState } from 'react';
import {
  BackgroundContainer,
  CheckboxContainer,
  CheckMarkContainer,
  Container,
  Label,
  Input
} from './style';
import { AiOutlineCheck as Icon } from 'react-icons/ai';
import { Control, useController } from 'react-hook-form';
import { getTransition } from '../../../helpers';

export interface CheckboxProps {
  name: string;
  control: Control<any>;
  loading?: boolean;
  defaultValue?: boolean;
  readOnly?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right';
  onChange?: (e: React.MouseEvent<HTMLDivElement | HTMLLabelElement>) => void;
}

const variants = {
  checked: { scale: 1 },
  unchecked: { scale: 0, opacity: 0 }
};

export const Checkbox: FC<CheckboxProps> = ({
  control,
  defaultValue = false,
  readOnly = false,
  label,
  labelPosition = 'right',
  name,
  loading = false,
  onChange
}) => {
  const [isChecked, setChecked] = useState<boolean>(defaultValue);
  const { field: checkbox } = useController({
    name,
    control,
    defaultValue: defaultValue
  });

  function onCheck(e: React.MouseEvent<HTMLDivElement | HTMLLabelElement>): void {
    if (readOnly) {
      return;
    }
    setChecked(!isChecked);

    // check if parent function is defined
    if (typeof onChange === 'function') {
      setTimeout(() => {
        onChange(e);
      }, 100); // timeout because the value change takes a second
    }
  }

  useEffect(() => {
    checkbox.onChange(isChecked);
  }, [isChecked]);

  if (loading) {
    return (
      <Container>
        {/* CASE: Show label before <CheckBox /> */}
        {labelPosition === 'left' && label && (
          <Label onClick={onCheck} position={labelPosition}>
            {label}
          </Label>
        )}
        <CheckboxContainer className="placeholder" isChecked={isChecked} readOnly={readOnly} />
        {/* CASE: show label after <CheckBox /> */}
        {labelPosition === 'right' && label && (
          <Label onClick={onCheck} position={labelPosition}>
            {label}
          </Label>
        )}
      </Container>
    );
  }

  return (
    <Container>
      {/* CASE: Show label before <CheckBox /> */}
      {labelPosition === 'left' && label && (
        <Label onClick={onCheck} position={labelPosition}>
          {label}
        </Label>
      )}
      <CheckboxContainer isChecked={isChecked} onClick={onCheck} readOnly={readOnly}>
        <BackgroundContainer
          animate={isChecked ? 'checked' : 'unchecked'}
          transition={getTransition()}
          variants={variants}
        />
        <CheckMarkContainer isChecked={isChecked}>
          <Icon size={18} />
        </CheckMarkContainer>

        {/*
            ##########################################
            Ignore this input field it is just here
            for the controller, but it is not visible for the user.
            ##########################################
          */}
        <Input
          {...checkbox}
          checked={isChecked}
          id={name}
          name={name}
          readOnly={readOnly}
          type="checkbox"
        />
      </CheckboxContainer>
      {/* CASE: show label after <CheckBox /> */}
      {labelPosition === 'right' && label && (
        <Label onClick={onCheck} position={labelPosition}>
          {label}
        </Label>
      )}
    </Container>
  );
};
