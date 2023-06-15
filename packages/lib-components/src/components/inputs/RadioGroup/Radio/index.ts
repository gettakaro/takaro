export { GenericRadio } from './Generic';
export type { RadioProps } from './Generic';
export type { GenericHandlers } from '..';

export { ControlledRadio } from './Controlled';
export type { ControlledRadioProps } from './Controlled';

// Type that should only be available on controlled and uncontrolled.
export type LabelPosition = { labelPosition: 'left' | 'right' };
