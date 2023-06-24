import { DrawerOptions, useDrawer } from './useDrawer';
import { FC, PropsWithChildren } from 'react';
import { DrawerContext } from './DrawerContext';
import { DrawerContent } from './DrawerContent';
import { DrawerHeading } from './DrawerHeading';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';

type SubComponentTypes = {
  Content: typeof DrawerContent;
  Heading: typeof DrawerHeading;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
};

export const Drawer: FC<PropsWithChildren<DrawerOptions>> & SubComponentTypes =
  ({ children, ...options }) => {
    return (
      <DrawerContext.Provider value={useDrawer(options)}>
        {children}
      </DrawerContext.Provider>
    );
  };

Drawer.Content = DrawerContent;
Drawer.Heading = DrawerHeading;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;
