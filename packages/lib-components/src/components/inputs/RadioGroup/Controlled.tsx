import { FC, useState } from 'react';
import { RadioGroupProps } from '.';
import {
  ControlledInputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';
import { ControlledRadio } from './Radio/Controlled';
import { FieldSet } from './style';

export type ControlledRadioGroupProps = ControlledInputProps & RadioGroupProps;

const defaultsApplier =
  defaultInputPropsFactory<ControlledRadioGroupProps>(defaultInputProps);

export const ControlledRadioGroup: FC<ControlledInputProps & RadioGroupProps> =
  (props) => {
    // TODO: implement hint and description
    const {
      loading,
      readOnly,
      value,
      name,
      size,
      label,
      options,
      control,
      required,
      disabled,
    } = defaultsApplier(props);

    const [selected, setSelected] = useState<string>(
      // check if value exists in options
      options.some((option) => option.value === value)
        ? (value as string)
        : options[0].value
    );

    return (
      <FieldSet>
        <legend>{label}</legend>
        <div>
          {options.map(({ label, labelPosition, value }) => {
            return (
              <ControlledRadio
                label={label}
                labelPosition={labelPosition}
                loading={loading}
                name={name}
                readOnly={readOnly}
                selected={selected === value}
                setSelected={setSelected}
                value={value}
                size={size}
                control={control}
                required={required}
                disabled={disabled}
              />
            );
          })}
        </div>
      </FieldSet>
    );
  };
