import { DrawerOptions, useDrawer } from './useDrawer';
import { FC, PropsWithChildren } from 'react';
import { DrawerContext } from './DrawerContext';

export const Drawer: FC<PropsWithChildren<DrawerOptions>> = ({
  children,
  ...options
}) => {
  return (
    <DrawerContext.Provider value={useDrawer(options)}>
      {children}
    </DrawerContext.Provider>
  );
};
export { DrawerContent } from './DrawerContent';
export { DrawerHeading } from './DrawerHeading';
export { DrawerBody } from './DrawerBody';
export { DrawerFooter } from './DrawerFooter';
