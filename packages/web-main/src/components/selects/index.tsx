import { SelectFieldProps, SelectQueryFieldProps, UnControlledSelectQueryFieldProps } from '@takaro/lib-components';

export type CustomSelectProps = Omit<SelectFieldProps, 'render' | 'children' | 'enableFilter'>;
export type CustomSelectQueryProps = Omit<
  SelectQueryFieldProps,
  | 'children'
  | 'handleInputValueChange'
  | 'isLoadingData'
  | 'debounce'
  | 'isFetchingNextPage'
  | 'isFetching'
  | 'fetchNextPage'
  | 'hasNextPage'
  | 'optionCount'
  | 'render'
>;

export type CustomUncontrolledSelectQueryFieldProps = Omit<
  UnControlledSelectQueryFieldProps,
  | 'hasError'
  | 'hasDescription'
  | 'isFetchingNextPage'
  | 'isFetching'
  | 'fetchNextPage'
  | 'hasNextPage'
  | 'render'
  | 'isLoadingData'
  | 'multiple'
  | 'debounce'
  | 'optionCount'
> & {
  value: string;
  onChange: (val: string) => void;
  name: string;
  readOnly?: boolean;
};

export { GameServerSelectQueryField } from './GameServerSelectQueryField';
export { RoleSelectQueryField } from './RoleSelectQueryField';
export { UnControlledRoleSelectQueryField } from './UnControlledRoleSelectQueryField';
export { PlayerSelectQueryField } from './PlayerSelectQueryField';
export { ModuleSelectQueryField } from './ModuleSelectQueryField';
export {
  ModuleVersionSelectQueryField,
  UnControlledModuleVersionSelectQueryField as UncontrolledModuleVersionSelectQueryField,
} from './ModuleVersionSelectQueryField';
export { DiscordRoleSelectQueryField } from './DiscordRoleSelectQueryField';

export { TimePeriodSelectField } from './TimePeriodSelectField';
export { CountrySelectField } from './CountrySelectField';
export { EventNameSelectField } from './EventNameSelectField';
