import { ErrorBoundary } from '@sentry/react';
import { HorizontalNav, styled } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const Route = createFileRoute('/_auth/_player/shop/$gameServerId')({
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  useDocumentTitle('shop');

  return (
    <>
      <Container>
        <HorizontalNav variant={'block'}>
          <Link activeOptions={{ exact: true }} to="/shop/$gameServerId" params={{ gameServerId }}>
            Shop
          </Link>
          <Link activeOptions={{ exact: true }} to="/shop/$gameServerId/orders" params={{ gameServerId }}>
            Orders
          </Link>
        </HorizontalNav>
      </Container>
      <ErrorBoundary>
        <div style={{ padding: '10px' }}>
          <Outlet />
        </div>
      </ErrorBoundary>
    </>
  );
}
