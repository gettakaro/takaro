import { styled } from '@takaro/lib-components';
import { useModule } from 'hooks/useModule';
import { CopyModulePopOver } from './CopyModulePopOver';

const Flex = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const Container = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: capitalize;
`;

export const Header = () => {
  const { moduleData } = useModule();

  return (
    <Container>
      <Flex>
        <span>{moduleData.name}</span>
        <CopyModulePopOver />
      </Flex>
    </Container>
  );
};
