import { FC } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@takaro/lib-components';
import { Outlet } from 'react-router-dom';

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

export const StudioFrame: FC = () => {
  return (
    <Container>
      <ContentContainer animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <Page>
          <Outlet />
        </Page>
      </ContentContainer>
    </Container>
  );
};
