import { FC, createRef } from 'react';
import {
  Button,
  ConfirmationModal,
  useModal,
  useOutsideAlerter,
} from '@takaro/lib-components';

interface  IDeleteButtonProps {
  action: () => Promise<void>; 
}


export const DeleteGameServerButton: FC<IDeleteButtonProps> = ({action}) => {
  const [Wrapper, open, close] = useModal();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => close());
  return (
    <div>
      <Wrapper>
        <ConfirmationModal
          action={action}
          actionText="OK, delete server"
          close={close}
          description="Are you sure you want to delete this server? This action cannot be undone."
          ref={ref}
          title="Delete server"
          type="error"
        />
      </Wrapper>
      <Button text={'Delete server'} onClick={open} color='error'/>
    </div>
  );
};
