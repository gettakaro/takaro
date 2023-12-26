import { SelectProps } from '@takaro/lib-components';

// TODO: implement multiSelect
export type CustomSelectProps = Omit<SelectProps, 'render' | 'children' | 'enableFilter' | 'required' | 'multiSelect'>;

export { GameServerSelect } from './GameServerSelect';
export { RolesSelect } from './RolesSelect';
export { PlayerSelect } from './PlayerSelect';
export { ModuleSelect } from './ModuleSelect';
