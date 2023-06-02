import { getTransition } from '../../../../helpers';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { Container, RadioContainer, Inner } from './style';
import { Label } from '../../../../components';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputProps,
} from '../../InputProps';

export interface RadioProps {
  selected: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
  defaultSelected?: boolean;
  labelPosition: 'left' | 'right';
}

type GenericRadioProps = GenericInputProps & RadioProps;

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 },
};

const defaultsApplier =
  defaultInputPropsFactory<GenericRadioProps>(defaultInputProps);

export const GenericRadio: FC<GenericRadioProps> = (props) => {
  const {
    readOnly,
    loading,
    name,
    size,
    required,
    value,
    onChange,
    error,
    selected,
    setSelected,
    labelPosition = 'left',
    label,
    disabled,
    hint,
  } = defaultsApplier(props);

  const handleOnClick = () => {
    if (readOnly) return;
    setSelected(value as string);
  };

  useEffect(() => {
    if (selected && !readOnly) {
      onChange(value);
    }
  }, [selected]);

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
