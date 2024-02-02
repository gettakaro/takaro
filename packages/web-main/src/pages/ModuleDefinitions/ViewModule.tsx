import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useModule } from 'queries/modules';
import { ModuleForm } from './ModuleForm';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { DrawerSkeleton } from '@takaro/lib-components';

const ViewModule: FC = () => {
  const { moduleId } = useParams() as { moduleId: string };
  const { data, isLoading, error } = useModule(moduleId);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return <DrawerSkeleton />;
  }

  if (error) {
    enqueueSnackbar('Could not load module', { variant: 'default', type: 'error' });
    navigate(PATHS.moduleDefinitions());
  }

  return <ModuleForm mod={data} error={null} />;
};

export default ViewModule;
