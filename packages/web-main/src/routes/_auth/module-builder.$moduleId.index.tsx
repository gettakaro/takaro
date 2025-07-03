import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from '../../hooks/useHasPermission';
import { globalGameServerSetingQueryOptions } from '../../queries/setting';
import { userMeQueryOptions } from '../../queries/user';

export const Route = createFileRoute('/_auth/module-builder/$moduleId/')({
  beforeLoad: async ({ context, params }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    const developerModeEnabled = await context.queryClient.ensureQueryData(
      globalGameServerSetingQueryOptions('developerMode'),
    );

    if (!hasPermission(session, ['MANAGE_MODULES']) && developerModeEnabled.value == 'true') {
      throw redirect({ to: '/forbidden' });
    }

    throw redirect({
      to: '/module-builder/$moduleId/$moduleVersionTag',
      params: { moduleId: params.moduleId, moduleVersionTag: 'latest' },
      replace: true,
    });
  },
  component: () => <div>Redirecting</div>,
});
