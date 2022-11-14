import { FC, useEffect, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Skeleton } from '../../../components';
import { Container, Dot, Line, Label, ContentContainer } from './style';
import { useController, Control } from 'react-hook-form';

export interface SwitchProps {
  name: string;
  control: Control<any>;
  loading?: boolean;
  defaultValue?: boolean;
  disabled?: boolean;
}

export const Switch: FC<SwitchProps> = ({
  name,
  control,
  loading = false,
  label,
  readOnly = false,
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
            readOnly={readOnly}
            isChecked={isChecked}
            layout
            transition={getTransition()}
          />
        </Line>
      </ContentContainer>
    </Container>
  );
};
