import { IconButton } from '../../../../components';
import {
  AiOutlineArrowUp as ArrowUpIcon,
  AiOutlineArrowDown as ArrowDownIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineDelete as DeleteIcon,
} from 'react-icons/ai';
import {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
  TranslatableString,
} from '@rjsf/utils';
import { ReactElement } from 'react';

export function TakaroButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: IconButtonProps<T, S, F>) {
  const { icon, color: _color, ...otherProps } = props;
  return <IconButton icon={icon as ReactElement} {...otherProps} />;
}

export function CopyButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: IconButtonProps<T, S, F>) {
  return <TakaroButton {...props} icon={<CopyIcon />} />;
}

export function MoveDownButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: IconButtonProps<T, S, F>) {
  const {
    registry: { translateString },
  } = props;
  return (
    <TakaroButton
      title={translateString(TranslatableString.MoveDownButton)}
      {...props}
      icon={<ArrowDownIcon />}
    />
  );
}

export function MoveUpButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: IconButtonProps<T, S, F>) {
  const {
    registry: { translateString },
  } = props;
  return (
    <TakaroButton
      title={translateString(TranslatableString.MoveUpButton)}
      {...props}
      icon={<ArrowUpIcon />}
    />
  );
}

export function RemoveButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: IconButtonProps<T, S, F>) {
  const { ...otherProps } = props;
  const {
    registry: { translateString },
  } = otherProps;
  return (
    <TakaroButton
      title={translateString(TranslatableString.RemoveButton)}
      {...otherProps}
      color="secondary"
      icon={<DeleteIcon />}
    />
  );
}
