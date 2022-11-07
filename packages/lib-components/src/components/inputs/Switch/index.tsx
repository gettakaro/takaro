import { FC, useEffect, useState } from 'react';
import { getTransition } from '../../../helpers';
import { Container, Dot, Line, Label, ContentContainer } from './style';
import { useController, Control } from 'react-hook-form';
export interface SwitchProps {
  /* Unique name, required to toggle the switch */
  name: string;
  control: Control<any>;
  loading?: boolean;
  defaultValue?: boolean;
  readOnly?: boolean;
  label?: string;
  onChange?: (isChecked: boolean) => void;
}

export const Switch: FC<SwitchProps> = ({
  name,
  control,
  loading = false,
  label,
  readOnly = false,
  defaultValue = false,
  onChange,
}) => {
  const [isChecked, setChecked] = useState<boolean>(defaultValue);
  const { field: sw } = useController({
    name,
    control,
    defaultValue: defaultValue,
  });

  function handleClick(): void {
    if (readOnly) return;
    setChecked((prev) => !prev);
    if (typeof onChange === 'function') onChange(sw.value);
  }

  useEffect(() => {
    sw.onChange(isChecked);
  }, [isChecked]);

  if (loading) {
    <div className="placeholder" />;
  }

  return (
    <Container>
      {/* this is the input component itself, but cannot be styled properly. */}
      <input
        {...sw}
        id={name}
        name={name}
        readOnly={readOnly}
        checked={isChecked}
        style={{ display: 'none' }}
        type="checkbox"
      ></input>
      {label && <Label htmlFor={name}>{label}</Label>}
      <ContentContainer onClick={handleClick}>
        <Line disabled={readOnly} isChecked={isChecked}>
          <Dot
            animate={{ right: isChecked ? '-2px' : '15px' }}
            disabled={readOnly}
            isChecked={isChecked}
            layout
            transition={getTransition()}
          />
        </Line>
      </ContentContainer>
    </Container>
  );
};
