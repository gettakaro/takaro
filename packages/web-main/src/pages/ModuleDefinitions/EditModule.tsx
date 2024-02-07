import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useModule, useModuleUpdate } from 'queries/modules';
import { ModuleForm, ModuleFormSubmitProps } from './ModuleForm';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { DrawerSkeleton } from '@takaro/lib-components';

const EditModule: FC = () => {
  // moduleId is awlays set to reach this component.
  const { moduleId } = useParams() as { moduleId: string };
  const { data, isLoading, error } = useModule(moduleId);
  const { mutate, isSuccess, isPending: isSubmitting, error: formError } = useModuleUpdate();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return <DrawerSkeleton />;
  }

  if (error) {
    enqueueSnackbar('Could not load module', { variant: 'default', type: 'error' });
    navigate(PATHS.moduleDefinitions());
  }

  const onSubmit = async (fields: ModuleFormSubmitProps) => {
    mutate({
      // if moduleId is not present it will have failed before this point.
      id: moduleId,
      moduleUpdate: {
        name: fields.name,
        description: fields.description,
        configSchema: fields.schema, // this is already stringified
        uiSchema: fields.uiSchema, // this is already stringified
        permissions: fields.permissions,
      },
    });
  };

  return <ModuleForm mod={data} onSubmit={onSubmit} isLoading={isSubmitting} isSuccess={isSuccess} error={formError} />;
};

export default EditModule;
