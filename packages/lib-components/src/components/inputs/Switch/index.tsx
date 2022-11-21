import { FC, useEffect, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Skeleton, Label } from '../../../components';
import { Container, Dot, Line, ContentContainer } from './style';
import { useController } from 'react-hook-form';
import { FormProps } from '../FormProps';

export interface SwitchProps extends FormProps {
  name: string;
  readOnly?: boolean;
  defaultValue?: boolean;
}

export const Switch: FC<SwitchProps> = ({
  name,
  control,
  loading = false,
  label,
  readOnly = false,
  defaultValue = false,
  error,
  size,
  required,
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
      {label && (
        <Label
          htmlFor={name}
          text={label}
          position="top"
          error={!!error}
          size={size}
          required={required}
          onClick={handleOnClick}
        />
      )}
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
