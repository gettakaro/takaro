import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { Card, styled } from '@takaro/lib-components';

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

const Title = styled.h1`
  text-align: center;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[8]};

  margin: auto;
  margin-top: -200px;
  height: 100vh;

  max-width: ${({ theme }) => theme.breakpoint.large};
`;

export const ModuleOnboarding: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Wrapper>
      <Title>Choose one to get started</Title>
      <Grid columns={3}>{children}</Grid>
    </Wrapper>
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
          Learn more
        </Link>
      </Flex>
    </ClickableCard>
  );
};
