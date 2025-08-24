import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/analytics/')({
  beforeLoad: () => {
    throw redirect({ to: '/analytics/shop', replace: true });
  },
});
