import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const Route = createFileRoute('/forbidden')({
  component: Component,
});

function Component() {
  useDocumentTitle('Forbidden');
  return (
    <ErrorPage
      errorCode={403}
      title="Forbidden"
      description="You are not authorized to view this page. Contact your server admin to request access."
      homeRoute={'/'}
    />
  );
}
