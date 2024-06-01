import { FC, useEffect } from 'react';
import { useSnackbar } from 'notistack';

export const NetworkDetector: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  // const [current, setCurrent] = useState();

  function hasNetwork(online: boolean) {
    if (online) {
      enqueueSnackbar('Your network is back online!', {
        variant: 'networkDetectorOnline',
        anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
      });
    } else {
      // offline
      // TODO: make this persistent, with custom button and custom child
      enqueueSnackbar('You are currently offline.', {
        variant: 'networkDetectorOffline',
        anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
        persist: true,
      });
    }
  }

  useEffect(() => {
    window.addEventListener('offline', () => hasNetwork(false));
    window.addEventListener('online', () => hasNetwork(true));

    // clean up
    return () => {
      window.removeEventListener('online', () => {
        /* */
      });
      window.removeEventListener('offline', () => {
        /* */
      });
    };
  }, []);

  return null;
};
