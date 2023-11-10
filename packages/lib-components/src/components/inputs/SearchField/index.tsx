import { Option } from './Generic/Option';
import { OptionGroup } from '../Select/Generic/OptionGroup';

// type is applied to both the generic and controlled select
export type SubComponentTypes = {
  Option: typeof Option;
  OptionGroup: typeof OptionGroup;
};

export { GenericSearchField } from '../SearchField/Generic';
export type { SearchFieldProps, GenericSearchFieldProps } from '../SearchField/Generic';

export { ControlledSearchField } from './Controlled';
export type { ControlledSearchFieldProps } from './Controlled';
