import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Meta, StoryFn } from '@storybook/react';

import { Dialog, DialogBody, DialogHeading, DialogContent } from '.';
import { Button, TextField } from '../../../components';

export default {
  title: 'Dialogs/Default',
  component: Dialog,
} as Meta;

export const Default: StoryFn = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { control } = useForm();

  // this should be typed ofcourse
  const handleSubmit = (data: any) => {
    console.log(data);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} text="Open dialog" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeading>New Module</DialogHeading>
          <DialogBody>
            <h2>Create module</h2>
            <p>Modules are what makes Takaro great.</p>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <TextField
                label="Module name"
                name="module-name"
                placeholder="cute kittens"
                control={control}
              />
              <Button text="Create module" type="submit" fullWidth />
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
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
      <Button onClick={() => setOpen(true)} text="Open dialog" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeading>New Module</DialogHeading>
          <DialogBody size="small">
            <h2>Go back to dashboard!</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <Button
              onClick={handleAction}
              size="large"
              fullWidth
              text="Go back to dashboard"
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};
