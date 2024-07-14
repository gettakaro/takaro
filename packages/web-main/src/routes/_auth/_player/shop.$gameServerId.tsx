import { ErrorBoundary } from '@sentry/react';
import { HorizontalNav, styled } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { gameServerQueryOptions } from 'queries/gameserver';

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;

  & > div {
    margin: auto;
  }
`;

export const Route = createFileRoute('/_auth/_player/shop/$gameServerId')({
  component: Component,
  loader: async ({ params, context }) => {
    return await context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId));
  },
});

function Component() {
  const { gameServerId } = Route.useParams();
  const gameServer = Route.useLoaderData();
  useDocumentTitle('shop');

  return (
    <>
      <Container>
        <h2>
          Shop of <strong>{gameServer.name}</strong>
        </h2>
        <div>
          <HorizontalNav variant={'block'}>
            <Link activeOptions={{ exact: true }} to="/shop/$gameServerId" params={{ gameServerId }}>
              Shop
            </Link>
            <Link activeOptions={{ exact: true }} to="/shop/$gameServerId/orders" params={{ gameServerId }}>
              Orders
            </Link>
          </HorizontalNav>
        </div>
      </Container>
      <ErrorBoundary>
        <div style={{ padding: '10px' }}>
          <Outlet />
        </div>
      </ErrorBoundary>
    </>
  );
}
