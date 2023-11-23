import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useModule, useModuleUpdate } from 'queries/modules';
import { ModuleForm, ModuleFormSubmitFields } from './ModuleForm';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';

const EditModule: FC = () => {
  const { moduleId } = useParams();
  const { data, isLoading, error } = useModule(moduleId!);
  const { mutate, isSuccess, isLoading: isSubmitting, error: formError } = useModuleUpdate();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  if (error) {
    enqueueSnackbar('Could not load module', { variant: 'default', type: 'error' });
    navigate(PATHS.moduleDefinitions());
  }

  const onSubmit = async (fields: ModuleFormSubmitFields) => {
    mutate({
      // if moduleId is not present it will have failed before this point.
      id: moduleId!,
      moduleUpdate: {
        name: fields.name,
        description: fields.description,
        configSchema: JSON.stringify(fields.schema),
        permissions: fields.permissions,
      },
    });
  };

  return <ModuleForm mod={data} onSubmit={onSubmit} isLoading={isSubmitting} isSuccess={isSuccess} error={formError} />;
};

export default EditModule;
