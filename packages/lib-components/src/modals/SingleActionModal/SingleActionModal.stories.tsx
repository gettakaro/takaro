import { createRef } from 'react';
import { Story, Meta } from '@storybook/react';
import { SingleActionModal } from '../../modals';
import { useModal } from '../../hooks';
import { useSnackbar } from 'notistack';
import { Button } from '../../components';

export default {
  title: 'Modals/SingleAction',
  component: undefined,
} as Meta;

///////////////
// SUCCESS
///////////////
export const Success: Story = () => {
  const [ModalWrapper, open, close] = useModal();
  const ref = createRef<HTMLDivElement>();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <div>
      <ModalWrapper>
        <SingleActionModal
          action={() => {
            enqueueSnackbar('Accept button pressed.', { type: 'success' });
          }}
          actionText="Go back to dashboard"
          close={close}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          ref={ref}
          title="Payment successful!"
          type="success"
        />
      </ModalWrapper>
      <Button onClick={open} text="Open Success Modal" />
    </div>
  );
};

///////////////
// ERROR
///////////////
export const Error: Story = () => {
  const [ModalWrapper, open, close] = useModal();

  return (
    <div>
      <ModalWrapper>
        <SingleActionModal
          actionText="Go back to dashboard"
          close={close}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          title="Payment failed!"
          type="error"
        />
      </ModalWrapper>

      <Button onClick={open} text="Open Error Modal" />
    </div>
  );
};
