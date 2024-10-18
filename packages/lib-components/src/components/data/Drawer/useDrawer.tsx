import { useMemo, useState } from 'react';
import { useClick, useDismiss, useFloating, useInteractions } from '@floating-ui/react';

export interface DrawerOptions {
  open?: boolean;
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  canDrag?: boolean;
  promptCloseConfirmation?: boolean;
}

export function useDrawer({
  initialOpen = false,
  canDrag = false,
  open: controlledOpen,
  promptCloseConfirmation = false,
  onOpenChange: setControlledOpen,
}: DrawerOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

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
    useDismiss(context, {
      outsidePressEvent: 'mousedown',
      outsidePress: (_mouseEvent) => {
        if (promptCloseConfirmation === true) {
          setShowConfirmDialog(true);
          return false;
        }
        return true;
      },
    }),
  ]);

  return useMemo(
    () => ({
      open,
      setOpen,
      showConfirmDialog,
      setShowConfirmDialog,
      ...interactions,
      ...data,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
      canDrag,
    }),
    [open, setOpen, interactions, data, labelId, descriptionId, showConfirmDialog],
  );
}
