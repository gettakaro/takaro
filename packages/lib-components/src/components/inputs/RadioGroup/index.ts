export { GenericRadioGroup } from './Generic';
export type { RadioGroupProps } from './Generic';

export { ControlledRadioGroup } from './Controlled';
export type { ControlledRadioGroupProps } from './Controlled';

export interface Option {
  labelPosition: 'left' | 'right';
  label: string;
  value: string;
}
