import { DialogOptions, useDialog } from '../../../hooks/useDialog';
import { FC, PropsWithChildren } from 'react';
import { DialogContext } from './DialogContext';

export const Dialog: FC<PropsWithChildren<DialogOptions>> = ({
  children,
  ...options
}) => {
  return (
    <DialogContext.Provider value={useDialog(options)}>
      {children}
    </DialogContext.Provider>
  );
};

export { DialogContent } from './DialogContent';
export { DialogHeading } from './DialogHeading';
export { DialogBody } from './DialogBody';
