import { Button, Dialog, FormError, TextField } from '@takaro/lib-components';
import { FC } from 'react';
import { RequiredDialogOptions } from '.';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInviteUser } from 'queries/user';

const validationSchema = z.object({
  userEmail: z.string().email('Email is not valid.').min(1),
});

export const UserInviteDialog: FC<RequiredDialogOptions> = ({ ...dialogOptions }) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
  });
  const { mutate, isPending, isError, isSuccess, error } = useInviteUser();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = (data) => {
    mutate({ email: data.userEmail });
  };

  if (isSuccess) {
    dialogOptions.onOpenChange(false);
  }

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading />
        <Dialog.Body>
          <h2>Invite user</h2>
          <p>
            Inviting users allows them to login to the Takaro dashboard. The user wil receive an email with a link to
            set their password.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="User email"
              name="userEmail"
              placeholder="example@example.com"
              control={control}
              required
            />
            {isError && <FormError error={error} />}
            <Button isLoading={isPending} text="Send invitation" type="submit" fullWidth />
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
