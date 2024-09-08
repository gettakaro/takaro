import { PERMISSIONS } from '@takaro/apiclient';
import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getUserPermissions, hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global/')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (hasPermission(session, [PERMISSIONS.ReadEvents])) {
      throw redirect({ to: '/dashboard' });
    }

    /* if user has no permissions at all, so can't see any page, redirect to forbidden */
    if (getUserPermissions(session).length === 0) {
      throw redirect({ to: '/forbidden' });
    }
  },

  component: () => {
    return (
      <ErrorPage
        errorCode={403}
        title="Forbidden"
        description="You are not authorized to view this page. Contact your server admin to request access."
        homeRoute={'/'}
      />
    );
  },
});
