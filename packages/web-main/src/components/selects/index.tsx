import { SelectFieldProps, SelectQueryFieldProps } from '@takaro/lib-components';

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
>;

export { GameServerSelectQueryField } from './GameServerSelectQueryField';
export { RoleSelectQueryField } from './RoleSelectQueryField';
export { PlayerSelectQueryField } from './PlayerSelectQueryField';
export { ModuleSelectQueryField } from './ModuleSelectQueryField';

export { TimePeriodSelectField } from './TimePeriodSelectField';
export { CountrySelectField } from './CountrySelectField';
export { EventNameSelectField } from './EventNameSelectField';
