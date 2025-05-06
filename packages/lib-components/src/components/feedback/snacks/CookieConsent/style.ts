import { styled } from '../../../../styled';
import { lighten } from 'polished';

export const Wrapper = styled.div`
  border: 0.1rem solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing['1_5']};
  max-width: 450px;
  border-radius: ${({ theme }) => theme.borderRadius.large};

  & > p {
    margin-top: ${({ theme }) => theme.spacing[1]};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
    font-size: 110%;
  }

  a {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }

  strong {
    font-weight: 600;
  }

  h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;

    svg {
      fill: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

export const Container = styled.div<{ isVisible: boolean }>`
  overflow: ${({ isVisible }): string => (isVisible ? 'visible' : 'hidden')};
  height: ${({ isVisible }) => (isVisible ? 'auto' : '0')};
  /* todo fix height change animation */
  transition: height 0.2s ease-in-out;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing[2]};

  button:last-child {
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
`;

export const ActionContainer = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  font-weight: 600;

  svg {
    margin-left: ${({ theme }) => theme.spacing['0_5']};
    ${({ active }): string => (active ? 'transform: rotate(180deg)' : '')};
    transition: transform 0.2s ease-in-out;
  }
`;

export const CookieTypeContainer = styled.div<{ active: boolean }>`
  border: 0.1rem solid ${({ theme }) => theme.colors.primary};
  margin: ${({ theme }) => `${theme.spacing[1]} 0`};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]} ${theme.spacing[1]} ${theme.spacing[1]}`};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  will-change: background-color;

  h4 {
    font-weight: 600;
  }

  div:first-child {
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
`;
export const NecessaryCookieContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => `${theme.spacing['1_5']} ${theme.spacing[2]}`};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  background-color: ${({ theme }) => lighten(0, theme.colors.primary)};

  p {
    color: white;
  }
`;
