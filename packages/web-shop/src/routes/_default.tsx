import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_default')({
  component: () => <div>Hello /_default!</div>,
});
