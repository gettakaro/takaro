import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ModuleSelectView, ModuleSelectViewProps } from './ModuleSelect';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ModuleOutputDTO } from '@takaro/apiclient';

export default {
  title: 'ModuleSelect',
  component: ModuleSelectView,
} as Meta<ModuleSelectViewProps>;

interface IFormInputs {
  moduleId: string;
}

export const Default: StoryFn<ModuleSelectViewProps> = () => {
  const { control, handleSubmit } = useForm<IFormInputs>();

  const modules: ModuleOutputDTO[] = [
    {
      id: '1',
      createdAt: '',
      updatedAt: '',
      name: 'Online Mock Server 1',
      description: '',
      hooks: [],
      commands: [],
      cronJobs: [],
      functions: [],
      uiSchema: '',
      permissions: [],
      systemConfigSchema: '',
      configSchema: '',
      builtin: '',
    },
  ];

  const onSubmit: SubmitHandler<IFormInputs> = ({ moduleId }) => {
    console.log(moduleId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModuleSelectView control={control} name="moduleId" modules={modules} />
    </form>
  );
};
