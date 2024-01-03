import { Option } from './Generic/Option';
import { OptionGroup } from '../SelectField/Generic/OptionGroup';

// type is applied to both the generic and controlled select
export type SubComponentTypes = {
  Option: typeof Option;
  OptionGroup: typeof OptionGroup;
};

export { GenericSelectQueryField } from '../SelectQueryField/Generic';
export type { SelectQueryFieldProps, GenericSelectQueryFieldProps } from '../SelectQueryField/Generic';

export { ControlledSelectQueryField } from './Controlled';
export type { ControlledSelectQueryFieldProps } from './Controlled';
