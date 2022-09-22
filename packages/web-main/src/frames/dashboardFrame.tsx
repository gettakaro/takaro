import { FC } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@takaro/lib-components';
import { Outlet } from 'react-router-dom';
import { Header } from 'components/Header';
import { Navbar } from 'components/SideNav';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const ContentContainer = styled(motion.div)`
  background-color: ${({ theme }): string => theme.colors.background};
  width: 100%;
  opacity: 0;
  overflow-y: auto;
`;
const Page = styled.div`
  padding: 3rem 8rem;
`;

export const DashboardFrame: FC = () => {
  return (
    <Container>
      <Navbar />
      <ContentContainer animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <Header />
        <Page>
          <Outlet />
        </Page>
      </ContentContainer>
    </Container>
  );
};
