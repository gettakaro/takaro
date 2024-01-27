import { ChangeEvent, createContext, useContext } from 'react';

interface ContextValue {
  selectedValue: string;
  setSelectedValue: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  disabled: boolean;
  readOnly: boolean;
}

export const RadioGroupContext = createContext<ContextValue>({} as ContextValue);

export const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error('Component must be wrapped with RadioGroup');
  }
  return context;
};
