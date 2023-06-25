import { DialogOptions, useDialog } from '../../../hooks/useDialog';
import { FC, PropsWithChildren } from 'react';
import { DialogContext } from './DialogContext';
import { DialogContent } from './DialogContent';
import { DialogBody } from './DialogBody';
import { DialogHeading } from './DialogHeading';

interface SubComponentTypes {
  Content: typeof DialogContent;
  Body: typeof DialogBody;
  Heading: typeof DialogHeading;
}

export const Dialog: FC<PropsWithChildren<DialogOptions>> & SubComponentTypes =
  ({ children, ...options }) => {
    return (
      <DialogContext.Provider value={useDialog(options)}>
        {children}
      </DialogContext.Provider>
    );
  };

Dialog.Content = DialogContent;
Dialog.Body = DialogBody;
Dialog.Heading = DialogHeading;
