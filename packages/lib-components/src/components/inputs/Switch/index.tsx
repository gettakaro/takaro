import { FC, useEffect, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Skeleton, Label } from '../../../components';
import { Wrapper, Container, Dot, Line, ContentContainer } from './style';
import { useController } from 'react-hook-form';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../InputProps';

const defaultsApplier = defaultInputPropsFactory<InputProps>(defaultInputProps);

export const Switch: FC<InputProps> = (props) => {
  const {
    readOnly,
    size,
    name,
    required,
    disabled,
    error,
    hint,
    label,
    loading,
    control,
    value = false,
  } = defaultsApplier(props);

  const { field } = useController({ name, control, defaultValue: value });
  const [isChecked, setChecked] = useState(field.value);

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
    <Wrapper>
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
            hint={hint}
            disabled={disabled}
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
      <p>{props.description}</p>
    </Wrapper>
  );
};
