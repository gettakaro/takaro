import { IconButton, Tooltip, useTheme } from '@takaro/lib-components';
import {
  AiOutlineArrowUp as ArrowUpIcon,
  AiOutlineArrowDown as ArrowDownIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineDelete as DeleteIcon,
} from 'react-icons/ai';
import { FormContextType, IconButtonProps, RJSFSchema, StrictRJSFSchema, TranslatableString } from '@rjsf/utils';

export function CopyButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: IconButtonProps<T, S, F>,
) {
  const {
    registry: { translateString },
  } = props;
  return (
    <Tooltip placement="left">
      <Tooltip.Trigger asChild>
        <IconButton {...props} icon={<CopyIcon />} ariaLabel="Copy item" color="primary" />
      </Tooltip.Trigger>
      <Tooltip.Content>{translateString(TranslatableString.CopyButton)}</Tooltip.Content>
    </Tooltip>
  );
}

export function MoveDownButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: IconButtonProps<T, S, F>,
) {
  const {
    registry: { translateString },
  } = props;
  return (
    <Tooltip placement="left">
      <Tooltip.Trigger asChild>
        <IconButton {...props} icon={<ArrowDownIcon />} ariaLabel="Move Item down" color="primary" />
      </Tooltip.Trigger>
      <Tooltip.Content>{translateString(TranslatableString.MoveDownButton)}</Tooltip.Content>
    </Tooltip>
  );
}

export function MoveUpButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: IconButtonProps<T, S, F>,
) {
  const {
    registry: { translateString },
  } = props;
  return (
    <Tooltip placement="left">
      <Tooltip.Trigger asChild>
        <IconButton {...props} icon={<ArrowUpIcon />} ariaLabel="Move Item up" color="primary" />
      </Tooltip.Trigger>
      <Tooltip.Content>{translateString(TranslatableString.MoveUpButton)}</Tooltip.Content>
    </Tooltip>
  );
}

export function RemoveButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: IconButtonProps<T, S, F>,
) {
  const { ...otherProps } = props;
  const theme = useTheme();
  const {
    registry: { translateString },
  } = otherProps;
  return (
    <Tooltip placement="left">
      <Tooltip.Trigger asChild>
        <IconButton
          {...props}
          icon={<DeleteIcon fill={theme.colors.error} />}
          ariaLabel="Remove Item"
          color="primary"
        />
      </Tooltip.Trigger>
      <Tooltip.Content>{translateString(TranslatableString.RemoveButton)}</Tooltip.Content>
    </Tooltip>
  );
}
