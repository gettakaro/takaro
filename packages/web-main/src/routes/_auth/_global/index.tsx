import { PERMISSIONS } from '@takaro/apiclient';
import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated === false) {
      throw redirect({ to: '/login' });
    }

    if (hasPermission(context.auth.session, [PERMISSIONS.ReadEvents])) {
      throw redirect({ to: '/dashboard' });
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
