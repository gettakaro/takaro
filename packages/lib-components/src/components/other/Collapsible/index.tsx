import { FC, PropsWithChildren, useState } from 'react';
import { CollapsibleContext } from './CollapsibleContext';
import { CollapsibleContent } from './CollapsibleContent';
import { CollapsibleTrigger } from './CollapsibleTrigger';

interface SubComponent {
  Trigger: typeof CollapsibleTrigger;
  Content: typeof CollapsibleContent;
}

export type CollapsibleProps = PropsWithChildren<{ open?: boolean }>;

export const Collapsible: FC<CollapsibleProps> & SubComponent = ({ children, open = false }) => {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <CollapsibleContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>{children}</CollapsibleContext.Provider>
  );
};

Collapsible.Trigger = CollapsibleTrigger;
Collapsible.Content = CollapsibleContent;
