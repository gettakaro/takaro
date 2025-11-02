import { DialogOptions } from '@takaro/lib-components/src/components/dialogs/Dialog/useDialog';

export type RequiredDialogOptions = DialogOptions & Required<Pick<DialogOptions, 'open' | 'onOpenChange'>>;
export interface DeleteImperativeHandle {
  triggerDelete: () => void;
}
