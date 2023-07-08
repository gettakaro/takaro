import { FC, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PATHS } from 'paths';
import { styled, HorizontalNav, HorizontalNavLink } from '@takaro/lib-components';
import { useLocation, useNavigate } from 'react-router-dom';

const Container = styled.div`
  height: 100%;
`;
const ContentContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing[2]};
`;

export const SettingsFrame: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === PATHS.settings.overview()) {
      navigate(PATHS.settings.GameServerSettings());
    }
  }, [location, navigate]);

  const links: HorizontalNavLink[] = [
    {
      text: 'Global Game Server Settings',
      // If serverId is not valid it will be directed by the failed requests.
      to: PATHS.settings.GameServerSettings(),
    },
    {
      text: 'Discord',
      to: PATHS.settings.discordSettings(),
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
