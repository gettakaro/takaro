import { ErrorBoundary } from '@sentry/react';
import { ShopOrderUpdateDTOStatusEnum } from '@takaro/apiclient';
import { Badge, HorizontalNav, styled, Tooltip } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { shopOrdersQueryOptions } from 'queries/shopOrder';

const shopOrdersQuery = shopOrdersQueryOptions({ filters: { status: [ShopOrderUpdateDTOStatusEnum.Paid] } });
export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop')({
  component: Component,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(shopOrdersQuery);
  },
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
  const loaderData = Route.useLoaderData();

  const { data: shopOrders } = useQuery({
    ...shopOrdersQuery,
    initialData: loaderData,
  });

  useDocumentTitle('Shop');

  const unClaimedShopOrdersCount = shopOrders?.data.length ?? 0;

  return (
    <>
      <Container>
        <HorizontalNav variant={'block'}>
          <Link activeOptions={{ exact: true }} to="/gameserver/$gameServerId/shop" params={{ gameServerId }}>
            Shop
          </Link>
          <Link
            activeOptions={{ exact: true }}
            to="/gameserver/$gameServerId/shop/orders"
            params={{ gameServerId }}
            style={{ position: 'relative' }}
          >
            <span>
              {unClaimedShopOrdersCount > 0 && (
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Badge variant="info" animate>
                      {unClaimedShopOrdersCount}
                    </Badge>
                  </Tooltip.Trigger>
                  <Tooltip.Content>You have {unClaimedShopOrdersCount} orders ready to be claimed!</Tooltip.Content>
                </Tooltip>
              )}
              Orders
            </span>
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
