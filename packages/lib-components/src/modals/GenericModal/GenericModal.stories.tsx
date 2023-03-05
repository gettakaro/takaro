import { createRef } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GenericModal, GenericModalProps } from '.';
import { useModal, useOutsideAlerter } from '../../hooks';
import { Button } from '../../components';

export default {
  title: 'Modals/GenericModal',
  args: {
    title: 'I am the title',
  },
} as Meta<GenericModalProps>;

export const Example: StoryFn<GenericModalProps> = ({ title }) => {
  const [ModalWrapper, open, close] = useModal();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => close());

  return (
    <div>
      <ModalWrapper>
        <GenericModal title={title} ref={ref} close={close}>
          <div>this is the body </div>
        </GenericModal>
      </ModalWrapper>
      <Button onClick={open} text="Open Modal" />
    </div>
  );
};
