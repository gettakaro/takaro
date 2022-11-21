import { getTransition } from '../../../../helpers';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { useController } from 'react-hook-form';
import { Container, RadioContainer, Inner } from './style';
import { Label } from '../../../../components';
import { FormProps } from '../../FormProps';

export interface RadioProps extends FormProps {
  name: string;
  selected: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
  defaultSelected?: boolean;
  readOnly: boolean;
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
  size,
  value,
  error,
  selected,
  setSelected,
  label = '',
  labelPosition,
  required,
}) => {
  const handleOnClick = () => {
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
        <RadioContainer
          isSelected={selected}
          className="placeholder"
          readOnly={true}
        />
      </Container>
    );
  }

  return (
    <Container>
      {labelPosition === 'left' && (
        <Label
          htmlFor={name}
          text={label}
          required={required}
          position={labelPosition}
          size={size}
          error={!!error}
          onClick={handleOnClick}
        />
      )}
      <RadioContainer
        isSelected={selected}
        onClick={handleOnClick}
        readOnly={readOnly}
      >
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
          position={labelPosition}
          required={required}
          error={!!error}
          text={label}
          size={size}
          onClick={handleOnClick}
        />
      )}
    </Container>
  );
};
