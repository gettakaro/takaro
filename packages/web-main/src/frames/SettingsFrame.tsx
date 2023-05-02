import { FC } from 'react';
import { styled, HorizontalNav } from '@takaro/lib-components';
import { Outlet } from 'react-router-dom';
import { PATHS } from 'paths';
import { HorizontalNavLink } from '@takaro/lib-components/src/components/navigation/HorizontalNav';

const Container = styled.div`
  height: 100%;
`;
const ContentContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing[2]};
`;

export const SettingsFrame: FC = () => {
  const links: HorizontalNavLink[] = [
    {
      text: 'Global Game Server Settings',
      // If serverId is not valid it will be directed by the failed requests.
      to: PATHS.settings.GameServerSettings,
    },
    {
      text: 'Connections',
      to: PATHS.settings.connections,
    },
  ];

  return (
    <Container>
      <HorizontalNav items={links} />
      <ContentContainer>
        <Outlet />
      </ContentContainer>
    </Container>
  );
};
