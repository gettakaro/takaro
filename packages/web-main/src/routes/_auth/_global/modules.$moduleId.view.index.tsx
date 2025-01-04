import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/view/')({
  beforeLoad: async ({ params }) => {
    throw redirect({
      to: '/modules/$moduleId/view/$moduleVersionTag',
      params: { moduleId: params.moduleId, moduleVersionTag: 'latest' },
      replace: true,
    });
  },
});
