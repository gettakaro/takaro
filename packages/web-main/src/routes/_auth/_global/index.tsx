import { PERMISSIONS } from '@takaro/apiclient';
import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getUserPermissions, hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/')({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isAuthenticated === false) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }

    if (hasPermission(context.auth.session, [PERMISSIONS.ReadEvents])) {
      throw redirect({ to: '/dashboard' });
    }

    /* if user has no permissions at all, so can't see any page, redirect to forbidden */
    if (getUserPermissions(context.auth.session).length === 0) {
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
