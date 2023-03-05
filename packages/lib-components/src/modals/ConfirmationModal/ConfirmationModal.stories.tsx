import { Meta, StoryFn } from '@storybook/react';
import { ConfirmationModal, ConfirmationModalProps } from '.';
import { useModal, useOutsideAlerter } from '../../hooks';
import { createRef } from 'react';
import { useSnackbar } from 'notistack';

export default {
  title: 'Modals/Confirmation',
  component: undefined,
  args: {
    title: 'This is the title of the modal',
    description: 'This is the description of the modal.',
    type: 'info',
    actionText: 'Accept',
  },
} as Meta<ConfirmationModalProps>;

export const Example: StoryFn<ConfirmationModalProps> = (args) => {
  const { enqueueSnackbar } = useSnackbar();
  const [Wrapper, open, close] = useModal();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => close());

  return (
    <div>
      <Wrapper>
        <ConfirmationModal
          {...args}
          action={() => {
            enqueueSnackbar('The message has been accepted', {
              variant: 'success',
            });
          }}
          close={close}
          ref={ref}
        />
      </Wrapper>
      <button onClick={open}>open modal</button>
    </div>
  );
};
