export { GameServerSelect } from './GameServerSelect';
import { Control } from 'react-hook-form';

export interface SelectProps {
  control: Control;
  isLoading?: boolean;
  name: string;
  label: string;
}
