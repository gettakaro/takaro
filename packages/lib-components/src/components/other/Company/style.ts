import { Color, Size, styled } from '../../../styled';

export const Container = styled.div<{ size: Size }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
  }

  div {
    font-weight: 800;
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
  textVisible: boolean;
  size: Size;
  color: Color;
}>`
  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return 'width: 15px; height: 15px;';
      case 'small':
        return 'width: 20px; height: 20px';
      case 'medium':
        return 'width: 30px; height: 30px;';
      case 'large':
        return 'width: 45px; height: 45px;';
      case 'huge':
        return 'width: 75px; height: 75px;';
    }
  }};
  fill: ${({ theme, color }): string => theme.colors[color]};
  margin-right: ${({ textVisible }) => (textVisible ? '1.5rem' : '0')};
`;
