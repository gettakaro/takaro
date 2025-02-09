import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { styled, Loading, ErrorPage } from '@takaro/lib-components';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import React, { Suspense } from 'react';
import { RouterContext } from '../router';

const LoadingContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: PendingComponent,
  notFoundComponent: () => <NotFound />,
  component: Component,
});

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

function Component() {
  return (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
      </Suspense>
    </>
  );
}

function PendingComponent() {
  return (
    <LoadingContainer>
      <Loading fill="#fff" />
    </LoadingContainer>
  );
}

function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <ErrorPage
      errorCode={404}
      title="Page not found"
      description="The page you are looking for does not exist."
      homeRoute={'/'}
    />
  );
}
