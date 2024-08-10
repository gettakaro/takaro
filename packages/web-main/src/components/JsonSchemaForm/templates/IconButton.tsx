import { IconButton, Tooltip } from '@takaro/lib-components';
import {
  AiOutlineArrowUp as ArrowUpIcon,
  AiOutlineArrowDown as ArrowDownIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineDelete as DeleteIcon,
} from 'react-icons/ai';
import { FormContextType, IconButtonProps, RJSFSchema, StrictRJSFSchema, TranslatableString } from '@rjsf/utils';
import { ReactElement } from 'react';

export function TakaroButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: IconButtonProps<T, S, F>,
) {
  const { icon, color: _color, ...otherProps } = props;
  return <IconButton icon={icon as ReactElement} ariaLabel="" {...otherProps} color="primary" />;
}

export function CopyButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: IconButtonProps<T, S, F>,
) {
  const {
    registry: { translateString },
  } = props;
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <TakaroButton {...props} icon={<CopyIcon />} />
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
    <Tooltip>
      <Tooltip.Trigger asChild>
        <TakaroButton {...props} icon={<ArrowDownIcon />} />
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
    <Tooltip>
      <Tooltip.Trigger asChild>
        <TakaroButton {...props} icon={<ArrowUpIcon />} />
      </Tooltip.Trigger>
      <Tooltip.Content>{translateString(TranslatableString.MoveUpButton)}</Tooltip.Content>
    </Tooltip>
  );
}

export function RemoveButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: IconButtonProps<T, S, F>,
) {
  const { ...otherProps } = props;
  const {
    registry: { translateString },
  } = otherProps;
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <TakaroButton
          title={translateString(TranslatableString.RemoveButton)}
          {...otherProps}
          color="secondary"
          icon={<DeleteIcon />}
        />
      </Tooltip.Trigger>
      <Tooltip.Content>{translateString(TranslatableString.RemoveButton)}</Tooltip.Content>
    </Tooltip>
  );
}
