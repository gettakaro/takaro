import { OptionGroup } from './Generic/OptionGroup';
import { Option } from './Generic/Option';

// type is applied to both the generic and controlled select
export type SubComponentTypes = {
  Option: typeof Option;
  OptionGroup: typeof OptionGroup;
};

export { GenericSelectField as GenericSelect } from './Generic';
export type { GenericSelectFieldProps as GenericSelectProps, SelectFieldProps as SelectProps } from './Generic';

export { ControlledSelectField as ControlledSelect } from './Controlled';
export type { ControlledSelectFieldProps as ControlledSelectProps } from './Controlled';
