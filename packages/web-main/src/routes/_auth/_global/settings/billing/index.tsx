import { Button, UsageCard } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';
import { getConfigVar } from 'util/getConfigVar';

export const Route = createFileRoute('/_auth/_global/settings/billing/')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['ROOT'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const planName = 'Hobby plan';

  return (
    <>
      <h1>{planName}</h1>
      <div>
        <div>
          <UsageCard title="Functions included in your plan" total={100_000} value={52_123} unit="Functions" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row', padding: '1rem' }}>
          <a href={getConfigVar('managePlanUrl')} target="_self">
            <Button size="large" text="Manage plan" />
          </a>
        </div>
      </div>
    </>
  );
}
