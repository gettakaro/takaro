import { SelectFieldProps, SelectQueryFieldProps } from '@takaro/lib-components';

// TODO: implement multiSelect
export type CustomSelectProps = Omit<SelectFieldProps, 'render' | 'children' | 'enableFilter'>;
export type CustomQuerySelectProps = Omit<
  SelectQueryFieldProps,
  'children' | 'handleInputValueChange' | 'isLoadingData' | 'debounce'
>;

export { GameServerSelect } from './GameServerSelect';
export { RoleSelect } from './RoleSelect';
export { PlayerSelect } from './PlayerSelect';
export { PlayerSelectQuery } from './PlayerSelectQuery';
export { ModuleSelect } from './ModuleSelect';
export { TimePeriodSelect } from './TimePeriodSelect';
export { CountrySelect } from './CountrySelect';
