import { Button } from '@takaro/lib-components';
import { useQueries } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { MaxUsageCard } from 'components/MaxUsageCard';
import { hasPermission } from 'hooks/useHasPermission';
import { gameServerCountQueryOptions } from 'queries/gameserver';
import { customModuleCountQueryOptions } from 'queries/module';
import { userCountQueryOptions, userMeQueryOptions } from 'queries/user';
import { variableCountQueryOptions } from 'queries/variable';
import { getConfigVar } from 'util/getConfigVar';
import { getCurrentDomain } from 'util/getCurrentDomain';

export const Route = createFileRoute('/_auth/_global/settings/billing/')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['ROOT'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
  loader: async ({ context }) => {
    const response = await fetch(`${getConfigVar('billingApiUrl')}/products`);
    const data = (await response.json()).data;
    data.sort((a: any, b: any) => {
      return a.prices[0].unitAmount - b.prices[0].unitAmount;
    });

    return {
      products: data,
      currentUserCount: await context.queryClient.ensureQueryData(userCountQueryOptions()),
      currentGameServerCount: await context.queryClient.ensureQueryData(gameServerCountQueryOptions()),
      currentVariableCount: await context.queryClient.ensureQueryData(gameServerCountQueryOptions()),
      currentModuleCount: await context.queryClient.ensureQueryData(customModuleCountQueryOptions()),
      me: await context.queryClient.ensureQueryData(userMeQueryOptions()),
    };
  },
});

function Component() {
  const loaderData = Route.useLoaderData();
  const [
    { data: currentUserCount },
    { data: currentGameServerCount },
    { data: currentVariableCount },
    { data: currentModuleCount },
    { data: me },
  ] = useQueries({
    queries: [
      { ...userCountQueryOptions(), initialData: loaderData.currentUserCount },
      { ...gameServerCountQueryOptions(), initialData: loaderData.currentGameServerCount },
      { ...variableCountQueryOptions(), initialData: loaderData.currentVariableCount },
      { ...customModuleCountQueryOptions(), initialData: loaderData.currentModuleCount },
      { ...userMeQueryOptions(), initialData: loaderData.me },
    ],
  });

  const currentDomain = getCurrentDomain(me);

  return (
    <div>
      <div>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <h1>Current plan usage</h1>
          <a href={getConfigVar('billingManageUrl')} target="_blank" rel="noreferrer">
            <Button size="large" text="Manage plan" />
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        <MaxUsageCard title="Maximum amount of users" value={currentUserCount} total={currentDomain.maxUsers} />
        <MaxUsageCard
          title="Maximum amount of game servers"
          value={currentGameServerCount}
          total={currentDomain.maxGameservers}
        />
        <MaxUsageCard
          title="Maximum amount of variables"
          value={currentVariableCount}
          total={currentDomain.maxVariables}
        />
        <MaxUsageCard title="Maximum amount of modules" value={currentModuleCount} total={currentDomain.maxModules} />
      </div>
    </div>
  );
}
