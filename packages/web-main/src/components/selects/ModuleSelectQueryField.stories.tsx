import { Meta, StoryFn } from '@storybook/react';
import { ModuleSelectView, ModuleSelectViewProps } from './ModuleSelectQueryField';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ModuleOutputDTO } from '@takaro/apiclient';

export default {
  title: 'ModuleSelectQueryField',
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
      supportedGames: ['all'],
      author: 'Takaro',
      latestVersion: {
        description: '',
        hooks: [],
        commands: [],
        cronJobs: [],
        functions: [],
        tag: 'latest',
        uiSchema: '',
        systemConfigSchema: '',
        configSchema: '',
        defaultSystemConfig: undefined,
        permissions: [],
        createdAt: '',
        updatedAt: '',
        id: '1',
        moduleId: '1',
      },
      builtin: '',
    },
  ];

  const onSubmit: SubmitHandler<IFormInputs> = ({ moduleId }) => {
    console.log(moduleId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModuleSelectView
        control={control}
        name="moduleId"
        modules={modules}
        fetchNextPage={() => {}}
        isFetchingNextPage={false}
        hasNextPage={false}
        isFetching={false}
        setModuleName={() => {}}
      />
    </form>
  );
};
