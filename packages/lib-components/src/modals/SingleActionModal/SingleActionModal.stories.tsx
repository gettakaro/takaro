import { createRef } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { SingleActionModal, SingleActionModalProps } from '.';
import { useModal } from '../../hooks';
import { useSnackbar } from 'notistack';

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
            enqueueSnackbar('Accept button pressed.', { variant: 'success' });
          }}
          close={close}
          ref={ref}
        />
      </ModalWrapper>
      <button onClick={open}>Open Success Modal</button>
    </div>
  );
};
