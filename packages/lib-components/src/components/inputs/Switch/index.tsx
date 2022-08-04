import { FC, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Container, Dot, Line, Label } from './style';
import { useController, Control } from 'react-hook-form';
export interface SwitchProps {
  /* Unique name, required to toggle the switch */
  name: string;
  control: Control<any>;
  defaultValue?: boolean;
  disabled?: boolean;
  onChange?: (isChecked: boolean) => void;
}

export const Switch: FC<SwitchProps> = ({
  name,
  control,
  defaultValue = false,
  disabled = false,
  onChange
}) => {
  const [isChecked, setChecked] = useState(defaultValue);
  const { field: sw } = useController({ name, control });

  function onCheck(): void {
    setChecked(!isChecked);
    if (typeof onChange === 'function') onChange(sw.value);
  }

  return (
    <Container>
      {/* this is the input component itself, but cannot be styled properly. */}
      <input
        disabled={disabled}
        id={name}
        name={name}
        onChange={onCheck}
        ref={sw.ref}
        style={{ display: 'none' }}
        type="checkbox"
      ></input>
      <Label htmlFor={name}>
        <Line disabled={disabled} isChecked={isChecked}>
          <Dot
            animate={{ right: isChecked ? '-2px' : '15px' }}
            disabled={disabled}
            isChecked={isChecked}
            layout
            transition={getTransition()}
          />
        </Line>
      </Label>
    </Container>
  );
};
