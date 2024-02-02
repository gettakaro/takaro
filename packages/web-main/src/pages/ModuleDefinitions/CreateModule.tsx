import { useModuleCreate } from 'queries/modules';
import { FC } from 'react';
import { ModuleForm, ModuleFormSubmitProps } from './ModuleForm';

const CreateModule: FC = () => {
  const { mutate, isSuccess, error, isPending } = useModuleCreate();
  const onSubmit = async (fields: ModuleFormSubmitProps) => {
    mutate({
      name: fields.name,
      description: fields.description,
      configSchema: fields.schema, // this is already stringified
      uiSchema: fields.uiSchema, // this is already stringified
      permissions: fields.permissions,
    });
  };
  return <ModuleForm onSubmit={onSubmit} isLoading={isPending} isSuccess={isSuccess} error={error} />;
};

export default CreateModule;
