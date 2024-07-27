import { useMemo, useState } from 'react';
import { useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';

export interface DialogOptions {
  open?: boolean;
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useDialog({
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DialogOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const context = data.context;

  const interactions = useInteractions([
    useClick(context, {
      enabled: controlledOpen == null,
    }),
    useDismiss(context, { outsidePressEvent: 'mousedown', bubbles: false }),
    useRole(context, { role: 'dialog' }),
  ]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [open, setOpen, interactions, data, labelId, descriptionId],
  );
}
