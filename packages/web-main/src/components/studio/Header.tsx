import { styled } from '@takaro/lib-components';
import { useModule } from 'hooks/useModule';
import { CopyModulePopOver } from './CopyModulePopOver';

const Flex = styled.div`
  display: flex;
  align-items: center;

  span {
    padding-top: 0.4rem;
  }
`;

const Container = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[1]};
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
