import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { RoleSelectView, RoleSelectViewProps } from './RoleSelect';
import { useForm, SubmitHandler } from 'react-hook-form';
import { RoleOutputDTO } from '@takaro/apiclient';

export default {
  title: 'RoleSelect',
  component: RoleSelectView,
} as Meta<RoleSelectViewProps>;

interface IFormInputs {
  roleId: string;
}

export const Default: StoryFn<RoleSelectViewProps> = () => {
  const { control, handleSubmit } = useForm<IFormInputs>();

  const roles: RoleOutputDTO[] = [
    {
      id: '1',
      name: 'Root',
      createdAt: '',
      updatedAt: '',
      permissions: [],
      system: true,
    },
    {
      id: '2',
      name: 'Admin',
      createdAt: '',
      updatedAt: '',
      permissions: [],
      system: false,
    },
  ];

  const onSubmit: SubmitHandler<IFormInputs> = ({ roleId }) => {
    console.log(roleId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RoleSelectView control={control} name="roleId" roles={roles} />
    </form>
  );
};
