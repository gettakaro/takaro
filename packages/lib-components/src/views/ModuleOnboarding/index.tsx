import { Card } from '../../components';
import { FC, PropsWithChildren } from 'react';
import { styled } from '../../styled';
import { Link } from 'react-router-dom';
import { FloatingOverlay } from '@floating-ui/react';
import { Breakpoint } from '../../styled/breakpoint';

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
  max-width: ${Breakpoint.medium};
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

const ClickableCard = styled(Card)`
  cursor: pointer;
  &:hover {
    transform: scale(1.0125);
  }
`;

type InfoCardProps = {
  title: string;
  onClick?: (e: React.MouseEvent) => void;
};

export const InfoCard: FC<PropsWithChildren<InfoCardProps>> = ({
  title,
  onClick,
  children,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // stops the parent onClick from firing
    e.stopPropagation();
  };

  return (
    <ClickableCard elevation={1} size="large" onClick={onClick}>
      <Flex>
        <h2>{title}</h2>
        {children}
        <Link
          className="underline"
          to={`https://docs.takaro.io/docs/application/modules#${title.toLowerCase()}`}
          target="_blank"
          onClick={handleClick}
        >
          <a>Learn more</a>
        </Link>
      </Flex>
    </ClickableCard>
  );
};
