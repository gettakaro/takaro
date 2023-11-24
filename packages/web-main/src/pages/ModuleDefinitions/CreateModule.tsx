import { useModuleCreate } from 'queries/modules';
import { FC } from 'react';
import { ModuleForm, ModuleFormSubmitFields } from './ModuleForm';

const CreateModule: FC = () => {
  const { mutate, isSuccess, error, isLoading } = useModuleCreate();
  const onSubmit = async (fields: ModuleFormSubmitFields) => {
    mutate({
      name: fields.name,
      description: fields.description,
      configSchema: fields.schema,
      permissions: fields.permissions,
    });
  };
  return <ModuleForm onSubmit={onSubmit} isLoading={isLoading} isSuccess={isSuccess} error={error} />;
};

export default CreateModule;
