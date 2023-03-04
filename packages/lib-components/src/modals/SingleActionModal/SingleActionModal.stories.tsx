import { createRef } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { SingleActionModal, SingleActionModalProps } from '.';
import { useModal } from '../../hooks';
import { useSnackbar } from 'notistack';
import { Button } from '../../components';

export default {
  title: 'Modals/SingleAction',
  component: undefined,
  args: {
    actionText: 'Go back to dashboard',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    title: 'Payment successful!',
    type: 'info',
  },
} as Meta<SingleActionModalProps>;

export const Example: StoryFn<SingleActionModalProps> = (args) => {
  const [ModalWrapper, open, close] = useModal();
  const ref = createRef<HTMLDivElement>();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <div>
      <ModalWrapper>
        <SingleActionModal
          {...args}
          action={() => {
            enqueueSnackbar('Accept button pressed.', { type: 'success' });
          }}
          close={close}
          ref={ref}
        />
      </ModalWrapper>
      <Button onClick={open} text="Open Success Modal" />
    </div>
  );
};

///////////////
// ERROR
///////////////
export const Error: StoryFn = () => {
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
