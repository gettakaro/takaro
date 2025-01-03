import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/settings/')({
  beforeLoad: () => {
    throw redirect({ to: '/settings/gameservers', replace: true });
  },
});
