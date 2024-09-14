import { Button, UsageCard } from '@takaro/lib-components';
import { createFileRoute, Link } from '@tanstack/react-router';

const STRIPE_MANAGE_BILLING_LINK = 'https://billing.stripe.com/p/login/test_eVacQH7DS4CX5Ik9AA';

export const Route = createFileRoute('/_auth/_global/settings/billing/')({
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
          <Link to="/settings/billing/plan">
            <Button size="large" text="Upgrade plan" />
          </Link>
          <a href={STRIPE_MANAGE_BILLING_LINK} target="_self">
            <Button size="large" text="Manage billing" />
          </a>
        </div>
      </div>
    </>
  );
}
