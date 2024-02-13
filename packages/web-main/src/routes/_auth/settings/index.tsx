import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/settings/')({
  beforeLoad: ({ navigate }) => {
    navigate({ to: '/settings/gameservers' });
  },
});
