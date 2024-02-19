import { moduleQueryOptions } from 'queries/modules';
import { ModuleForm } from './-modules/ModuleForm';
import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/view')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ params, context }) => context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const mod = Route.useLoaderData();
  return <ModuleForm mod={mod} error={null} />;
}
