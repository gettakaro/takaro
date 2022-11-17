import { Color, Size, styled } from '../../../styled';

export const Default = styled.button<{ size: Size; color: Color }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
  border-radius: 1rem;
  border: 3px solid transparent;
  background-clip: padding-box;
  cursor: pointer;
  background-color: ${({ theme, color }) => theme.colors[color]};

  svg {
    cursor: pointer;
    fill: white;
    stroke: white;
  }

  }};

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 2px;
        `;
      case 'small':
        return `
          padding: 4px;
        `;
      case 'medium':
        return `
          padding: 8px;
        `;
      case 'large':
        return `
          padding: 16px;
        `;
      case 'huge':
        return `
          padding: 30px;
        `;
    }
  }};
`;

export const Outline = styled(Default)<{ color: Color }>`
  svg {
    path {
      fill: ${({ theme, color }) => theme.colors[color]};
      stroke: ${({ theme, color }) => theme.colors[color]};
    }
  }
  background: none;
  border: 0.2rem solid ${({ theme, color }) => theme.colors[color]};
  &:hover {
    background: transparent;
  }
`;

export const Clear = styled(Outline)<{ color: Color }>`
  &:hover {
    background: rgb(243, 245, 249) none repeat scroll 0% 0%;
  }
  border: none;
`;
