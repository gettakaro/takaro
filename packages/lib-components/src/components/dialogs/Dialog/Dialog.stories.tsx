import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Meta, StoryFn } from '@storybook/react';

import { Dialog } from '.';
import { Button, TextField } from '../../../components';

export default {
  title: 'Dialogs/Default',
  component: Dialog,
} as Meta;

export const Default: StoryFn = () => {
  interface IFormInputs {
    moduleName: string;
  }

  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<IFormInputs>();
  const { control, handleSubmit } = useForm<IFormInputs>();

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    setData(data);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Heading>New Module</Dialog.Heading>
          <Dialog.Body>
            <h2>Create module</h2>
            <p>Modules are what makes Takaro great.</p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField label="Module name" name="moduleName" placeholder="cute kittens" control={control} />
              <Button type="submit" fullWidth>
                Create module
              </Button>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
      <pre>result: {data?.moduleName}</pre>
    </>
  );
};

export const SingleActionDialog: StoryFn = () => {
  const [open, setOpen] = useState<boolean>(false);

  const handleAction = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Heading>New Module</Dialog.Heading>
          <Dialog.Body size="small">
            <h2>Go back to dashboard!</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
            <Button onClick={handleAction} size="large" fullWidth>
              Go back to dashboard
            </Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
