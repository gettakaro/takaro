import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { PERMISSIONS, AnalyticsControllerGetShopAnalyticsPeriodEnum } from '@takaro/apiclient';
import { hasPermission } from '../../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../../queries/user';
import { shopAnalyticsQueryOptions } from '../../../../queries/analytics';
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { styled } from '@takaro/lib-components';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelectField, GameServerSelectQueryField } from '../../../../components/selects';
import { KPICards } from './shop/-components/KPICards';
import { CustomerSegmentChart } from './shop/-components/CustomerSegmentChart';
import { RecentOrdersList } from './shop/-components/RecentOrdersList';
import { InsightsBar } from './shop/-components/InsightsBar';
import { TopSellingItemsChart } from './shop/-components/TopSellingItemsChart';
import { RevenueOverTimeChart } from './shop/-components/RevenueOverTimeChart';
import { SalesActivityChart } from './shop/-components/SalesActivityChart';
import { OrderStatusDistribution } from './shop/-components/OrderStatusDistribution';
import { RevenueDistributionChart } from './shop/-components/RevenueDistributionChart';
import { zodValidator } from '@tanstack/zod-adapter';
import { fallback } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { useEffect } from 'react';

const shopAnalyticsSearchSchema = z.object({
  period: z
    .nativeEnum(AnalyticsControllerGetShopAnalyticsPeriodEnum)
    .optional()
    .default(AnalyticsControllerGetShopAnalyticsPeriodEnum.Last30Days),
  gameServerIds: fallback(z.array(z.string()), []).optional().default([]),
});

export const Route = createFileRoute('/_auth/_global/analytics/shop')({
  validateSearch: zodValidator(shopAnalyticsSearchSchema),
  loaderDeps: ({ search: { period, gameServerIds } }) => ({
    period,
    gameServerIds,
  }),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ManageShopListings])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, deps }) => {
    const analyticsData = await context.queryClient.ensureQueryData(
      shopAnalyticsQueryOptions(deps.gameServerIds.length > 0 ? deps.gameServerIds : undefined, deps.period),
    );
    return { analyticsData };
  },
  component: Component,
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ControlBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
  width: 100%;

  > div:first-child {
    flex: 0 1 300px;
    min-width: 180px;
  }

  > div:nth-child(2) {
    flex: 0 0 150px;
  }
`;

const ChartSection = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const TwoColumnRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(500px, 100%), 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: stretch;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const ThreeColumnRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: stretch;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const LastUpdated = styled.div`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
  margin-left: auto;
`;

function Component() {
  useDocumentTitle('Shop Analytics');
  const { analyticsData: initialAnalyticsData } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  const { control } = useForm({
    defaultValues: {
      period: search.period,
      gameServers: search.gameServerIds,
    },
  });

  const selectedPeriod = useWatch({ control, name: 'period' });
  const selectedGameServers = useWatch({ control, name: 'gameServers' });

  useEffect(() => {
    navigate({
      search: {
        period: selectedPeriod,
        gameServerIds: selectedGameServers,
      },
    });
  }, [selectedPeriod, selectedGameServers, navigate]);

  const { data: analyticsData, isFetching } = useQuery({
    ...shopAnalyticsQueryOptions(search.gameServerIds.length > 0 ? search.gameServerIds : undefined, search.period),
    initialData: initialAnalyticsData,
  });

  return (
    <Container>
      <Header>
        <ControlBar>
          <div>
            <GameServerSelectQueryField control={control} name="gameServers" multiple={true} canClear={true} />
          </div>
          <div>
            <TimePeriodSelectField control={control} name="period" />
          </div>
          <LastUpdated>
            Last updated: {DateTime.fromISO(analyticsData.lastUpdated || DateTime.now().toISO()).toRelative()}
          </LastUpdated>
        </ControlBar>
      </Header>
      <KPICards kpis={analyticsData.kpis} isLoading={isFetching} />
      <ChartSection>
        <TwoColumnRow>
          <RevenueOverTimeChart revenue={analyticsData.revenue} />
          <SalesActivityChart revenue={analyticsData.revenue} />
        </TwoColumnRow>
        <ThreeColumnRow>
          <TopSellingItemsChart products={analyticsData.products} />
          <RevenueDistributionChart products={analyticsData.products} />
          <OrderStatusDistribution orders={analyticsData.orders} />
        </ThreeColumnRow>
        <TwoColumnRow>
          <CustomerSegmentChart customers={analyticsData.customers} />
          <RecentOrdersList orders={analyticsData.orders.recentOrders} />
        </TwoColumnRow>
      </ChartSection>
      <InsightsBar insights={analyticsData.insights} />
    </Container>
  );
}
