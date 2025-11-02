import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button, Dialog, ValueConfirmationField, ValueConfirmationFieldProps } from '../../../components';

export default {
  title: 'Inputs/ValueConfirmationField',
  component: ValueConfirmationField,
  args: {
    id: 'deleteConfirmation',
    value: 'Takaro is the best',
  },
} as Meta<ValueConfirmationFieldProps>;

export const OnChange: StoryFn<ValueConfirmationFieldProps> = (args) => {
  const [valid, setValid] = useState<boolean>(false);

  return (
    <Dialog initialOpen={true}>
      <Dialog.Content>
        <Dialog.Heading>New module </Dialog.Heading>
        <Dialog.Body>
          <h2>Delete module</h2>
          <p style={{ textAlign: 'center' }}>
            Are you sure you want to delete this module? This action cannot be undone. Type
            <strong>{args.value}</strong> to confirm
          </p>
          <ValueConfirmationField id={args.id} onValidChange={(valid) => setValid(valid)} value={args.value} />
          <Button disabled={valid}>Confirm</Button>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
