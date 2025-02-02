import { Button, HorizontalNav, Plan, styled } from '@takaro/lib-components';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';
import { getConfigVar } from 'util/getConfigVar';
import { z } from 'zod';

const planSearchSchema = z.object({
  period: z.enum(['monthly', 'annual']).default('monthly'),
});

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const Route = createFileRoute('/_auth/_global/settings/billing/')({
  validateSearch: (search) => planSearchSchema.parse(search),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['ROOT'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
  loader: async () => {
    const response = await fetch(`${getConfigVar('billingApiUrl')}/products`);
    const data = (await response.json()).data;

    data.sort((a: any, b: any) => {
      return a.prices[0].unitAmount - b.prices[0].unitAmount;
    });

    return data;
  },
});

function Component() {
  const { period } = Route.useSearch();
  const products = Route.useLoaderData();

  return (
    <>
      <div>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row', padding: '1rem' }}>
          <a href={getConfigVar('managePlanUrl')} target="_self">
            <Button size="large" text="Manage plan" />
          </a>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', columnGap: '2rem' }}>
        <div>
          <h1>Choose your plan</h1>
          <p>Choose the plan that best fits your needs.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
          <HorizontalNav variant="clear">
            <Link to="/settings/billing" search={{ period: 'monthly' }}>
              Monthly{' '}
            </Link>
            <Link to="/settings/billing" search={{ period: 'annual' }}>
              Annually - 10% off
            </Link>
          </HorizontalNav>
        </div>
      </div>

      <Container>
        {products.map((product: any, index: number) => {
          return (
            <Plan
              key={product.id}
              highlight={index === 1}
              title={`${product.name} plan`}
              description="Lorem ipsum dolor sit amet consect etur adipisicing elit. Itaque amet indis perferendis blanditiis repellendus etur quidem assumenda."
              buttonText="Select Plan"
              to={product.prices[0].url}
              currency={product.prices[0].currency}
              price={`${product.prices[0].unitAmount}`}
              period={period === 'monthly' ? 'month' : 'year'}
              features={Object.keys(product.features).map((featureName) => {
                return `${featureName}: ${product.features[featureName] ?? 'unlimited'}`;
              })}
            />
          );
        })}
      </Container>
    </>
  );
}
