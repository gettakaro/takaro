import { FC, useEffect, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Container, Dot, Line, Label } from './style';
import { useController, Control } from 'react-hook-form';
export interface SwitchProps {
  name: string;
  control: Control<any>;
  defaultValue?: boolean;
  disabled?: boolean;
}

export const Switch: FC<SwitchProps> = ({
  name,
  control,
  defaultValue = false,
  disabled = false,
}) => {
  const [isChecked, setChecked] = useState(defaultValue);
  const { field } = useController({ name, control });

  function handleOnClick(): void {
    setChecked(!isChecked);
  }

  useEffect(() => {
    field.onChange(isChecked);
  }, [isChecked]);

  return (
    <Container onClick={handleOnClick}>
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
