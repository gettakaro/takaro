import { styled } from '../../../../styled';
import { lighten } from 'polished';

export const Wrapper = styled.div`
  border: 0.2rem solid ${({ theme }) => theme.colors.primary};
  padding: 1.5rem;
  max-width: 450px;
  border-radius: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.default};

  & > p {
    margin-top: 1rem;
    margin-bottom: 1rem;
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
  margin-top: 2rem;

  button:last-child {
    margin-left: 1rem;
  }
`;

export const ActionContainer = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: 600;

  svg {
    margin-left: 0.5rem;
    ${({ active }): string => (active ? 'transform: rotate(180deg)' : '')};
    transition: transform 0.2s ease-in-out;
  }
`;

export const CookieTypeContainer = styled.div<{ active: boolean }>`
  border: 0.1rem solid ${({ theme }) => theme.colors.primary};
  margin: 1rem 0;
  padding: 1rem 2rem 1rem 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  will-change: background-color;

  h4 {
    font-weight: 600;
  }

  div:first-child {
    margin-right: 1rem;
  }
`;
export const NecessaryCookieContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => lighten(0, theme.colors.primary)};

  p {
    color: white;
  }
`;
