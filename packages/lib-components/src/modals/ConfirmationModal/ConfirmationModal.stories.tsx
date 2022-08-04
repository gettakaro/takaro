import { Story, Meta } from '@storybook/react';
import { ConfirmationModal } from '.';
import { useModal, useOutsideAlerter } from '../../hooks';
import { createRef } from 'react';
import { useSnackbar } from 'notistack';

export default {
  title: 'Modals/Confirmation',
  component: undefined
} as Meta;

export const Example: Story = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [Wrapper, open, close] = useModal();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => close());

  return (
    <div>
      <Wrapper>
        <ConfirmationModal
          action={() => {
            enqueueSnackbar('The message has been accepted', {
              variant: 'success'
            });
          }}
          actionText="Accept"
          close={close}
          description="This is the description of the modal."
          ref={ref}
          title="This is the title of the modal"
          type="info"
        />
      </Wrapper>
      <button onClick={open}>open modal</button>
    </div>
  );
};
