import { createFileRoute, redirect } from '@tanstack/react-router';
import { PERMISSIONS } from '@takaro/apiclient';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { shopAnalyticsQueryOptions } from '../../../queries/analytics';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { styled, IconButton, Skeleton } from '@takaro/lib-components';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelectField, GameServerSelectQueryField } from '../../../components/selects';
import { AiOutlineReload as RefreshIcon } from 'react-icons/ai';
import { KPICards } from './analytics.shop/-components/KPICards';
import { RevenueCharts } from './analytics.shop/-components/RevenueCharts';
import { ProductCharts } from './analytics.shop/-components/ProductCharts';
import { CustomerCharts } from './analytics.shop/-components/CustomerCharts';
import { InsightsBar } from './analytics.shop/-components/InsightsBar';

export const Route = createFileRoute('/_auth/_global/analytics/shop')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ManageShopListings])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    // Load initial analytics data with default parameters
    const endDate = DateTime.now().toISO();
    const startDate = DateTime.now().minus({ days: 30 }).toISO();

    const analyticsData = await context.queryClient.ensureQueryData(
      shopAnalyticsQueryOptions(undefined, startDate!, endDate!),
    );

    return { analyticsData };
  },
  component: ShopAnalyticsPage,
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  h1 {
    font-size: ${({ theme }) => theme.fontSize.huge};
    margin: 0;
  }
`;

const ControlBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
  flex-wrap: wrap;
`;

const ChartSection = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const LastUpdated = styled.div`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
  margin-left: auto;
`;

function ShopAnalyticsPage() {
  useDocumentTitle('Shop Analytics');
  const loaderData = Route.useLoaderData();

  const { control } = useForm({
    defaultValues: {
      period: 'last30Days',
      gameServers: [] as string[],
    },
  });

  const selectedPeriod = useWatch({ control, name: 'period' });
  const selectedGameServers = useWatch({ control, name: 'gameServers' });

  const { startDate, endDate } = useMemo(() => {
    let startDate: string | null;
    const endDate = DateTime.now().toISO();

    switch (selectedPeriod) {
      case 'last24Hours':
        startDate = DateTime.now().minus({ days: 1 }).toISO();
        break;
      case 'last7Days':
        startDate = DateTime.now().minus({ days: 7 }).toISO();
        break;
      case 'last30Days':
        startDate = DateTime.now().minus({ days: 30 }).toISO();
        break;
      case 'last90Days':
        startDate = DateTime.now().minus({ days: 90 }).toISO();
        break;
      default:
        startDate = DateTime.now().minus({ days: 30 }).toISO();
    }

    return { startDate: startDate!, endDate: endDate! };
  }, [selectedPeriod]);

  const {
    data: analyticsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    ...shopAnalyticsQueryOptions(selectedGameServers.length > 0 ? selectedGameServers : undefined, startDate, endDate),
    initialData: loaderData.analyticsData,
  });

  if (isLoading && !analyticsData) {
    return (
      <Container>
        <Header>
          <h1>Shop Analytics</h1>
        </Header>
        <KPICards isLoading={true} />
        <ChartSection>
          <Skeleton variant="rectangular" height="400px" />
        </ChartSection>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Shop Analytics</h1>
        <ControlBar>
          <div style={{ width: '300px' }}>
            <GameServerSelectQueryField control={control} name="gameServers" multiple={true} canClear={true} />
          </div>
          <div style={{ width: '200px' }}>
            <TimePeriodSelectField control={control} name="period" />
          </div>
          <IconButton
            icon={<RefreshIcon />}
            onClick={() => refetch()}
            ariaLabel="Refresh analytics"
            disabled={isFetching}
          />
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
