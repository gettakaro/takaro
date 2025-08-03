import { useMemo, useRef, useState } from 'react';
import {
  autoUpdate,
  offset,
  Placement,
  useFloating,
  useInteractions,
  useRole,
  useDismiss,
  useListNavigation,
  useTypeahead,
  useClick,
  shift,
  flip,
} from '@floating-ui/react';

export interface UseDropdownOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useDropdown({
  initialOpen = false,
  placement = 'bottom',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UseDropdownOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const elementsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { context, ...data } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({ mainAxis: 10 }),
      flip({
        fallbackPlacements: ['top', 'bottom'],
      }),
      shift(),
    ],
  });

  const interactions = useInteractions([
    useClick(context, { enabled: controlledOpen == null }),
    useRole(context, { role: 'menu' }),
    useDismiss(context),
    useListNavigation(context, {
      listRef: elementsRef,
      onNavigate: setActiveIndex,
      activeIndex,
    }),
    useTypeahead(context, {
      enabled: context.open,
      activeIndex,
      listRef: labelsRef,
      onMatch: setActiveIndex,
    }),
  ]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      context,
      ...data,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
      activeIndex,
      labelsRef,
      elementsRef,
    }),
    [open, setOpen, data, context, labelId, descriptionId, interactions],
  );
}
