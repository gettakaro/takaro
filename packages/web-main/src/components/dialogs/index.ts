import { DialogOptions } from '@takaro/lib-components/src/components/dialogs/Dialog/useDialog';

export type RequiredDialogOptions = DialogOptions & Required<Pick<DialogOptions, 'open' | 'onOpenChange'>>;
export interface DeleteImperativeHandle {
  triggerDelete: () => void;
}

export { ModuleCopyDialog } from './ModuleCopyDialog';
export { ModuleDeleteDialog } from './ModuleDeleteDialog';
export { ModuleExportDialog } from './ModuleExportDialog';
export { ModuleTagDialog } from './ModuleTagDialog';
export { ModuleUninstallDialog } from './ModuleUninstallDialog';
