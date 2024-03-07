import { styled } from '@takaro/lib-components';
import { CopyModulePopOver } from './CopyModulePopOver';
import { useStudioContext } from './useStudioStore';

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
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  height: ${({ theme }) => theme.spacing[4]};
`;

export const Header = () => {
  const moduleName = useStudioContext((s) => s.moduleName);
  const moduleId = useStudioContext((s) => s.moduleId);

  return (
    <Container>
      <Flex>
        <span>{moduleName}</span>
        <CopyModulePopOver moduleId={moduleId} />
      </Flex>
    </Container>
  );
};
