import { getTransition } from '../../../../helpers';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { Control, useController } from 'react-hook-form';
import { Container, RadioContainer, Inner, Label } from './style';

export interface RadioProps {
  name: string;
  control: Control<any>;
  loading?: boolean;
  selected: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
  defaultSelected?: boolean;
  readOnly: boolean;
  label?: string;
  value: string;
  labelPosition: 'left' | 'right';
}

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 },
};

export const Radio: FC<RadioProps> = ({
  name,
  control,
  loading = false,
  readOnly,
  value,
  selected,
  setSelected,
  label = '',
  labelPosition,
}) => {
  const onSelect = () => {
    if (readOnly) return;
    setSelected(value);
  };

  useEffect(() => {
    if (selected && !readOnly) {
      field.onChange(value);
    }
  }, [selected]);

  const { field } = useController({
    name,
    control,
    defaultValue: selected ?? value,
  });

  /* todo: handle loading state */
  if (loading) {
    return (
      <Container>
        <RadioContainer className="placeholder" readOnly={true} />
      </Container>
    );
  }

  return (
    <Container>
      {labelPosition === 'left' && (
        <Label htmlFor={name} isLeft onClick={onSelect} readOnly={readOnly}>
          {label}
        </Label>
      )}
      <RadioContainer onClick={onSelect} readOnly={readOnly}>
        <Inner
          animate={selected ? 'selected' : 'deselected'}
          isSelected={selected}
          readOnly={readOnly}
          transition={getTransition()}
          variants={variants}
        />
      </RadioContainer>
      {labelPosition === 'right' && (
        <Label
          htmlFor={name}
          isLeft={false}
          onClick={onSelect}
          readOnly={readOnly}
        >
          {label}
        </Label>
      )}
    </Container>
  );
};
