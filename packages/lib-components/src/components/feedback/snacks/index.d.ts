import { DefaultSnackProps } from './Default';
import { DrawerSnackProps } from './Drawer';

declare module 'notistack' {
  interface VariantOverrides {
    // disable default variants
    success: false;
    error: false;
    info: false;
    warning: false;

    default: DefaultSnackProps;
    draw: DrawerSnackProps;
  }
}
