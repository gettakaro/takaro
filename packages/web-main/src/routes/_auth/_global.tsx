import { createFileRoute } from '@tanstack/react-router';
import { BaseLayout } from 'components/BaseLayout';

export const Route = createFileRoute('/_auth/_global')({
  component: Component,
});

function Component() {
  return <BaseLayout showGameServerNav={false} />;
}
