import { FC, PropsWithChildren } from 'react';
import { Elevation, Size, styled } from '../../../styled';

const Container = styled.div<{ size: Size; elevation: Elevation }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 0.6rem;
  margin: ${({ theme }) => `${theme.spacing[1]} 0`};
  box-shadow: ${({ theme, elevation }): string => theme.elevation[elevation]};
  color: ${({ theme }) => theme.colors.text};

  ${({ theme, size }) => {
    switch (size) {
      case 'tiny':
        return `padding: ${theme.spacing['0_25']}`;
      case 'small':
        return `padding: ${theme.spacing['0_5']}`;
      case 'medium':
        return `padding: ${theme.spacing['1_5']}`;
      case 'large':
        return `padding: ${theme.spacing['2_5']}`;
      case 'huge':
        return `padding: ${theme.spacing[5]}`;
    }
  }};

  &.placeholder {
    width: 100%;
    height: 500px; /* TODO: this should be based on the **density** and **size** */
  }
`;

export interface CardProps {
  size?: Size;
  loading?: boolean;
  elevation: Elevation;
}

// TODO: implement skeleton loading
export const Card: FC<PropsWithChildren<CardProps>> = ({
  children,
  size = 'medium',
  loading = false,
  elevation,
}) => {
  if (loading)
    return <Container elevation={0} size="large" className="placeholder" />;

  return (
    <Container elevation={elevation} size={size}>
      {children}
    </Container>
  );
};
