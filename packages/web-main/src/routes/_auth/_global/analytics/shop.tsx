import { createFileRoute, redirect } from '@tanstack/react-router';
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
import { RevenueCharts } from './shop/-components/RevenueCharts';
import { ProductCharts } from './shop/-components/ProductCharts';
import { CustomerCharts } from './shop/-components/CustomerCharts';
import { InsightsBar } from './shop/-components/InsightsBar';

export const Route = createFileRoute('/_auth/_global/analytics/shop')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ManageShopListings])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    // Load initial analytics data with default parameters
    const analyticsData = await context.queryClient.ensureQueryData(
      shopAnalyticsQueryOptions(undefined, AnalyticsControllerGetShopAnalyticsPeriodEnum.Last30Days),
    );

    return { analyticsData };
  },
  component: ShopAnalyticsPage,
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

const LastUpdated = styled.div`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
  margin-left: auto;
`;

function ShopAnalyticsPage() {
  useDocumentTitle('Shop Analytics');

  const { control } = useForm({
    defaultValues: {
      period: AnalyticsControllerGetShopAnalyticsPeriodEnum.Last30Days,
      gameServers: [] as string[],
    },
  });

  const selectedPeriod = useWatch({ control, name: 'period' });
  const selectedGameServers = useWatch({ control, name: 'gameServers' });

  const { data: analyticsData, isFetching } = useQuery(
    shopAnalyticsQueryOptions(selectedGameServers.length > 0 ? selectedGameServers : undefined, selectedPeriod),
  );

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
            Last updated: {DateTime.fromISO(analyticsData?.lastUpdated || DateTime.now().toISO()).toRelative()}
          </LastUpdated>
        </ControlBar>
      </Header>

      {/* KPI Cards Section */}
      <KPICards kpis={analyticsData?.kpis} isLoading={isFetching} />

      {/* Chart Sections */}
      <ChartSection>
        <RevenueCharts revenue={analyticsData?.revenue} isLoading={isFetching} />

        <ProductCharts products={analyticsData?.products} orders={analyticsData?.orders} isLoading={isFetching} />

        <CustomerCharts customers={analyticsData?.customers} orders={analyticsData?.orders} isLoading={isFetching} />
      </ChartSection>

      {/* Insights Bar */}
      <InsightsBar insights={analyticsData?.insights} isLoading={isFetching} />
    </Container>
  );
}
