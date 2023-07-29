import { PropsWithChildren, FC } from 'react';
import { UseDropdownOptions, useDropdown } from './useDropdown';
import { DropdownContext } from './DropdownContext';
import { DropdownTrigger } from './DropdownTrigger';
import { DropdownMenu } from './DropdownMenu';

interface SubComponents {
  Trigger: typeof DropdownTrigger;
  Menu: typeof DropdownMenu;
}

export type DropdownProps = PropsWithChildren<UseDropdownOptions>;

export const Dropdown: FC<DropdownProps> & SubComponents = ({ children, ...restOptions }) => {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const dropdown = useDropdown({ ...restOptions });
  return <DropdownContext.Provider value={dropdown}>{children}</DropdownContext.Provider>;
};

Dropdown.Trigger = DropdownTrigger;
Dropdown.Menu = DropdownMenu;
