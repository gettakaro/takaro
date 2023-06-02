import { Card } from '../../components';
import { FC, PropsWithChildren } from 'react';
import { styled } from '../../styled';
import { Link } from 'react-router-dom';
import { FloatingOverlay } from '@floating-ui/react';
import { Breakpoints } from '../../styled/breakpoints';

const Flex = styled.div<{ justifyContent?: string }>`
  display: flex;
  flex-direction: column;
  justify-content: ${({ justifyContent }) => justifyContent || 'space-between'};
  row-gap: ${({ theme }) => theme.spacing[1]};
  height: 100%;
`;

const Grid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  height: 250px;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const CenterGrid = styled.div`
  display: grid;
  place-items: center;
  margin: auto;
  height: 75%;
  max-width: ${Breakpoints.medium};
`;

export const ModuleOnboarding: FC<PropsWithChildren> = ({ children }) => {
  return (
    <FloatingOverlay lockScroll>
      <CenterGrid>
        <Card size="large" elevation={2}>
          <Flex>
            <h1>Choose one to get started</h1>
            <Grid columns={3}>{children}</Grid>
          </Flex>
        </Card>
      </CenterGrid>
    </FloatingOverlay>
  );
};

type InfoCardProps = {
  title: string;
  onClick?: () => void;
};

export const InfoCard: FC<PropsWithChildren<InfoCardProps>> = ({
  title,
  onClick,
  children,
}) => {
  return (
    <Card
      elevation={1}
      size="large"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Flex>
        <h2>{title}</h2>
        {children}
        <Link
          className="underline"
          to={`https://docs.takaro.io/docs/application/modules#${title.toLowerCase()}`}
          target="_blank"
        >
          <a>Learn more</a>
        </Link>
      </Flex>
    </Card>
  );
};
