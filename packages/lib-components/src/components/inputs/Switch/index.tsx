import { FC, useEffect, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Skeleton } from '../../../components';
import { Container, Dot, Line, Label, ContentContainer } from './style';
import { useController, Control } from 'react-hook-form';

export interface SwitchProps {
  name: string;
  control: Control<any>;
  loading?: boolean;
  readOnly?: boolean;
  defaultValue?: boolean;
  label?: string;
}

export const Switch: FC<SwitchProps> = ({
  name,
  control,
  loading = false,
  label,
  readOnly = false,
  defaultValue = false,
}) => {
  const [isChecked, setChecked] = useState(defaultValue);
  const { field } = useController({ name, control });

  function handleOnClick(): void {
    setChecked(!isChecked);
  }

  useEffect(() => {
    field.onChange(isChecked);
  }, [isChecked]);

  if (loading) {
    return (
      <Container>
        {label && <div>{label}</div>}
        <Skeleton variant="text" width="30px" height="15px" />
      </Container>
    );
  }

  return (
    <Container>
      {label && <Label htmlFor={name}>{label}</Label>}
      <ContentContainer onClick={handleOnClick}>
        <Line readOnly={readOnly} isChecked={isChecked}>
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
