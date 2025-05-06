import { Card, Chip, Company, styled, Tooltip } from '@takaro/lib-components';
import { DomainOutputDTO, DomainOutputDTOStateEnum } from '@takaro/apiclient';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useUserSetSelectedDomain, userMeQueryOptions } from '../../queries/user';
import { MdDomain as DomainIcon } from 'react-icons/md';
import { AiOutlineArrowRight as ArrowRightIcon } from 'react-icons/ai';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TAKARO_DOMAIN_COOKIE_REGEX } from '../../util/domainCookieRegex';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const DomainCardList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: auto;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  max-width: 1000px;
  margin: ${({ theme }) => theme.spacing[2]} auto auto auto;

  @media (max-width: 1500px) {
    grid-template-columns: 1fr;
  }
`;

const InnerBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
`;

export const Route = createFileRoute('/_auth/domain/select')({
  component: Component,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(userMeQueryOptions());
  },
});

function Component() {
  const loaderData = Route.useLoaderData();
  const currentDomain = document.cookie.replace(TAKARO_DOMAIN_COOKIE_REGEX, '$1');
  const { data: me } = useQuery({ ...userMeQueryOptions(), initialData: loaderData });

  // Keep current domain at the top
  me.domains.sort((a, b) => {
    if (a.id === currentDomain) {
      return -1;
    }
    if (b.id === currentDomain) {
      return 1;
    }
    return 0;
  });

  return (
    <Container>
      <Company />
      <DomainCardList>
        {me.domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} isCurrentDomain={currentDomain === domain.id} />
        ))}
      </DomainCardList>
    </Container>
  );
}

interface DomainCardProps {
  domain: DomainOutputDTO;
  isCurrentDomain: boolean;
}

function DomainCard({ domain, isCurrentDomain }: DomainCardProps) {
  const navigate = useNavigate();
  const { mutate, isSuccess } = useUserSetSelectedDomain();
  const queryClient = useQueryClient();
  const isDisabled = domain.state === DomainOutputDTOStateEnum.Disabled;

  const handleDomainSelectedClick = () => {
    // Logging into a disabled domain is going to error out
    if (isDisabled) return;

    if (isCurrentDomain === false) {
      mutate({ domainId: domain.id });
    } else {
      navigate({ to: '/dashboard' });
    }
  };

  if (isSuccess) {
    queryClient.clear();
    navigate({ to: '/dashboard' });
  }

  function getDomainChip() {
    switch (domain.state) {
      case DomainOutputDTOStateEnum.Disabled: {
        return (
          <Tooltip>
            <Tooltip.Trigger>
              <Chip color="error" label="Disabled" />
            </Tooltip.Trigger>
            <Tooltip.Content>Domain disabled - this is likely due to an expired plan.</Tooltip.Content>
          </Tooltip>
        );
      }
      case DomainOutputDTOStateEnum.Active: {
        return <Chip color="success" label="Active" />;
      }
      case DomainOutputDTOStateEnum.Maintenance: {
        return (
          <Tooltip>
            <Tooltip.Trigger>
              <Chip color="warning" label="Disabled" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              Domain in maintenance mode - We're likely upgrading our system, and everything should be back up shortly.
              If not, reach out to us on Discord!
            </Tooltip.Content>
          </Tooltip>
        );
      }
    }
  }

  return (
    <Card
      role="link"
      onClick={domain.state === DomainOutputDTOStateEnum.Active ? handleDomainSelectedClick : undefined}
    >
      <Card.Body>
        <InnerBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <DomainIcon size={30} />
            <div style={{ display: 'flex', gap: '10px' }}>
              {isCurrentDomain && <Chip color="primary" label="current domain" />}
              {getDomainChip()}
            </div>
          </div>
          <h2 style={{ display: 'flex', alignItems: 'center' }}>
            {domain.name}
            <ArrowRightIcon size={18} style={{ marginLeft: '10px' }} />
          </h2>
        </InnerBody>
      </Card.Body>
    </Card>
  );
}
