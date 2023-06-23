import { FC, PropsWithChildren } from 'react';
import { TooltipOptions, useTooltip } from './useTooltip';
import { TooltipContext } from './TooltipContext';
import { TooltipTrigger } from './TooltipTrigger';
import { TooltipContent } from './TooltipContent';

/*
 * tooltip is the wrapper component that provides the context
 * trigger is the component that triggers the tooltip to open (the thing you hover over)
 * content is the component that is rendered inside the tooltip
 */
interface SubComponentTypes {
  Trigger: typeof TooltipTrigger;
  Content: typeof TooltipContent;
}
export type TooltipProps = PropsWithChildren<TooltipOptions>;

export const Tooltip: FC<TooltipProps> & SubComponentTypes = ({
  children,
  ...options
}) => {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);
  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  );
};

Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;
