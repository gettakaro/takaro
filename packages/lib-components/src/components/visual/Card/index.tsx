import { FC, PropsWithChildren } from 'react';
import { Elevation, Size, styled } from '../../../styled';

const Container = styled.div<{ size: Size; elevation: Elevation }>`
  background-color: white;
  border-radius: 0.6rem;
  margin: 1rem 0;
  box-shadow: ${({ theme, elevation }): string => theme.elevation[elevation]};
  color: ${({ theme }) => theme.colors.text};

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return 'padding: 0.225rem';
      case 'small':
        return 'padding: 0.5rem';
      case 'medium':
        return '1.5rem';
      case 'large':
        return '2.5rem';
      case 'huge':
        return '4rem';
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
