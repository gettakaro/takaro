import { useMemo, useState } from 'react';
import { useClick, useDismiss, useFloating, useInteractions } from '@floating-ui/react';

export interface DrawerOptions {
  open?: boolean;
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  canDrag?: boolean;
}

export function useDrawer({
  initialOpen = false,
  canDrag = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DrawerOptions) {
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
    useDismiss(context, { outsidePressEvent: 'mousedown' }),
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
      canDrag,
    }),
    [open, setOpen, interactions, data, labelId, descriptionId],
  );
}
