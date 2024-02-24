import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/players')({
  component: () => <div>Hello /_auth/_global/players!</div>,
});
