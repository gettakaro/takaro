import { FC, useEffect, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Skeleton, Label } from '../../../components';
import { Wrapper, Container, Dot, Line, ContentContainer } from './style';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../InputProps';

interface GenericSwitchProps extends InputProps {
  onChange: (...event: unknown[]) => unknown;
  onBlur: (...event: unknown[]) => unknown;
  error?: string;
}

const defaultsApplier =
  defaultInputPropsFactory<GenericSwitchProps>(defaultInputProps);

export const GenericSwitch: FC<GenericSwitchProps> = (props) => {
  const {
    readOnly,
    size,
    name,
    required,
    disabled,
    hint,
    label,
    error,
    loading,
    onChange,
    value = false,
  } = defaultsApplier(props);

  const [isChecked, setChecked] = useState<boolean>(value as boolean);

  function handleOnClick(): void {
    setChecked(!isChecked);
  }

  useEffect(() => {
    onChange(isChecked);
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
