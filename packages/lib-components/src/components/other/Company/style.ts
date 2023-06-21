import { Color, Size, styled } from '../../../styled';

export const Container = styled.div<{ textVisible?: boolean; size: Size }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;

  gap: ${({ theme, textVisible }) =>
    textVisible ? theme.spacing['1'] : theme.spacing[0]};

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
  }

  div {
    font-weight: 700;
    color: ${({ theme }): string => theme.colors.text};

    font-size: ${({ size }) => {
      switch (size) {
        case 'tiny':
          return '1.5rem';
        case 'small':
          return '2rem';
        case 'medium':
          return '3rem';
        case 'large':
          return '4rem';
        case 'huge':
          return '5rem';
      }
    }};
  }
`;

export const Svg = styled.svg<{
  size: Size;
  color: Color;
}>`
  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return 'width: 1.5rem; height: 1.5rem;';
      case 'small':
        return 'width: 2rem; height: 2rem';
      case 'medium':
        return 'width: 3rem; height: 3rem;';
      case 'large':
        return 'width: 4rem; height: 4rem;';
      case 'huge':
        return 'width: 5rem; height: 5rem;';
    }
  }};
  fill: ${({ theme, color }): string => theme.colors[color]};
`;
