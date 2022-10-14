import { FC } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@takaro/lib-components';
import { Outlet } from 'react-router-dom';
import { Header } from 'components/Header';
import { Navbar } from 'components/SideNav';
import { WorkbenchNavbar } from 'components/modules/WorkbenchSideNav';
import { WorkbenchActions } from 'components/modules/WorkbenchActions';

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
`;

export const ModuleWorkbenchFrame: FC = () => {
  return (
    <Container>
      <WorkbenchNavbar />
      <ContentContainer animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <Page>
          <Outlet />
        </Page>
      </ContentContainer>
      <WorkbenchActions/>
    </Container>
  );
};
