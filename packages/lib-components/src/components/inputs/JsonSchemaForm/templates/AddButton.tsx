import { Button } from '../../../../components';
import { AiOutlinePlus as AddIcon } from 'react-icons/ai';
import {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
  TranslatableString,
} from '@rjsf/utils';

/** The `AddButton` renders a button that represent the `Add` action on a form
 */
export function AddButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ registry, ...props }: IconButtonProps<T, S, F>) {
  const { translateString } = registry;
  return (
    <Button
      disabled={props.disabled}
      color="primary"
      size="small"
      icon={<AddIcon />}
      text={translateString(TranslatableString.AddItemButton)}
    />
  );
}
