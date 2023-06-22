import { OptionGroup } from './Generic/OptionGroup';
import { Option } from './Generic/Option';

// type is applied to both the generic and controlled select
export type SubComponentTypes = {
  Option: typeof Option;
  OptionGroup: typeof OptionGroup;
};

export { GenericSelect } from './Generic';
export type { GenericSelectProps, SelectProps } from './Generic';

export { ControlledSelect } from './Controlled';
export type { ControlledSelectProps } from './Controlled';
