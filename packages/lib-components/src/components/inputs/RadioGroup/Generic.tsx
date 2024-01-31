import { ChangeEvent, FC, PropsWithChildren } from 'react';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { RadioItem } from './RadioItem';
import { Container } from './style';
import { setAriaDescribedBy } from '../layout';
import { RadioGroupContext } from './context';

export interface RadioGroupSubComponents {
  Item: typeof RadioItem;
}

export type RadioGroupProps = PropsWithChildren<GenericInputProps<string, HTMLInputElement>>;
const defaultsApplier = defaultInputPropsFactory<RadioGroupProps>(defaultInputProps);

export const GenericRadioGroup: FC<RadioGroupProps> & RadioGroupSubComponents = (props) => {
  const { readOnly, value, name, onChange, hasDescription, disabled, children } = defaultsApplier(props);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return;
    onChange(e);
  };

  return (
    <Container role="radiogroup" aria-describedby={setAriaDescribedBy(name, hasDescription)}>
      <RadioGroupContext.Provider
        value={{ name, selectedValue: value, setSelectedValue: handleChange, readOnly, disabled }}
      >
        {children}
      </RadioGroupContext.Provider>
    </Container>
  );
};

GenericRadioGroup.Item = RadioItem;
