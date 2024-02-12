import { moduleOptions } from 'queries/modules';
import { ModuleForm } from './-modules/ModuleForm';
import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/modules/view/$moduleId')({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(moduleOptions(params.moduleId)),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const mod = Route.useLoaderData();
  return <ModuleForm mod={mod} error={null} />;
}
