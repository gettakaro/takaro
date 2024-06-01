import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/settings/')({
  beforeLoad: ({ navigate }) => {
    navigate({ to: '/settings/gameservers' });
  },
});
