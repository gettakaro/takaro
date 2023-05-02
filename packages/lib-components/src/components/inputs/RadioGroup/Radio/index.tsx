import { getTransition } from '../../../../helpers';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { useController } from 'react-hook-form';
import { Container, RadioContainer, Inner } from './style';
import { Label } from '../../../../components';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../../InputProps';

export interface RadioProps extends InputProps {
  name: string;
  selected: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
  defaultSelected?: boolean;
  value: string;
  labelPosition: 'left' | 'right';
}

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 },
};

const defaultsApplier = defaultInputPropsFactory<RadioProps>(defaultInputProps);

export const Radio: FC<RadioProps> = (props) => {
  const {
    readOnly,
    control,
    loading,
    name,
    size,
    required,
    value,
    selected,
    setSelected,
    labelPosition = 'left',
    label,
    disabled,
    hint,
  } = defaultsApplier(props);

  const handleOnClick = () => {
    if (readOnly) return;
    setSelected(value);
  };

  useEffect(() => {
    if (selected && !readOnly) {
      field.onChange(value);
    }
  }, [selected]);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: selected ?? value,
  });

  /* todo: handle loading state */
  if (loading) {
    return (
      <Container isSelected={selected}>
        <RadioContainer
          isSelected={selected}
          className="placeholder"
          readOnly={true}
        />
      </Container>
    );
  }

  return (
    <Container isSelected={selected} onClick={handleOnClick}>
      {label && labelPosition === 'left' && (
        <Label
          htmlFor={name}
          text={label}
          required={required}
          position={labelPosition}
          size={size}
          error={!!error}
          onClick={handleOnClick}
          disabled={disabled}
          hint={hint}
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
      {label && labelPosition === 'right' && (
        <Label
          htmlFor={name}
          position={labelPosition}
          required={required}
          error={!!error}
          text={label}
          size={size}
          disabled={disabled}
          onClick={handleOnClick}
          hint={hint}
        />
      )}
    </Container>
  );
};
