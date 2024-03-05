import { PropsWithChildren, FC } from 'react';
import { PopoverOptions, usePopover } from './usePopover';
import { PopoverContext } from './PopoverContext';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';

interface SubComponents {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
}

export type PopoverProps = PropsWithChildren<PopoverOptions>;

export const Popover: FC<PopoverProps> & SubComponents = ({ children, modal = false, ...restOptions }) => {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const popover = usePopover({ modal, ...restOptions });
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
};

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
