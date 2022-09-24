import { FC, useState, createRef } from 'react';
import {
  styled,
  Button,
  ConfirmationModal,
  useModal,
  useOutsideAlerter,
} from '@takaro/lib-components';
import { useSnackbar } from 'notistack';

export const DeleteGameServerButton: FC = () => {
  const [Wrapper, open, close] = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => close());
  return (
    <div>
      <Wrapper>
        <ConfirmationModal
          action={() => {
            enqueueSnackbar('The server was deleted', {
              variant: 'success',
            });
          }}
          actionText="OK, delete server"
          close={close}
          description="Are you sure you want to delete this server? This action cannot be undone."
          ref={ref}
          title="Delete server"
          type="warning"
        />
      </Wrapper>
      <Button text={'Delete server'} onClick={open} color='error'/>
    </div>
  );
};
