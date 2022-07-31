import { getTransition } from '../../../../helpers';
import { FC, useEffect } from 'react';
import { Control, useController } from 'react-hook-form';
import { Container, RadioContainer, Inner, Label, Input } from './style';

export interface RadioProps {
  name: string;
  control: Control<any>;
  loading?: boolean;
  selected: boolean;
  setSelected: any;
  defaultSelected?: boolean;
  readOnly: boolean;
  label?: string;
  value: string;
  labelPosition: 'left' | 'right';
  onChange?: (e: React.MouseEvent<HTMLDivElement | HTMLLabelElement>) => void;
}

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 }
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
  defaultSelected = false,
  labelPosition,
  onChange = undefined
}) => {
  const onSelect = () => {
    if (readOnly) return;

    setSelected(value);
  };

  useEffect(() => {
    if (selected && !readOnly) {
      inputProps.onChange(value);
    }
  }, [selected]);

  const {
    field: { ref, ...inputProps }
  } = useController({
    name,
    control,
    defaultValue: selected ? value : undefined
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
        <Label htmlFor={name} isLeft={false} onClick={onSelect} readOnly={readOnly}>
          {label}
        </Label>
      )}
      {/* Ignore, this is is just for the react-hook-form to handle forms */}
      <Input
        {...inputProps}
        checked={selected}
        id={name}
        name={name}
        ref={ref}
        type="radio"
        value={value}
      />
    </Container>
  );
};
