import { ErrorBoundary } from '@sentry/react';
import { HorizontalNav, styled } from '@takaro/lib-components';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop')({
  component: Component,
  pendingComponent: () => <div>Loading...</div>,
});

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

function Component() {
  const { gameServerId } = Route.useParams();
  useDocumentTitle('Shop');

  return (
    <>
      <Container>
        <HorizontalNav variant={'block'}>
          <Link activeOptions={{ exact: true }} to="/gameserver/$gameServerId/shop" params={{ gameServerId }}>
            Shop
          </Link>
          <Link activeOptions={{ exact: true }} to="/gameserver/$gameServerId/shop/orders" params={{ gameServerId }}>
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
