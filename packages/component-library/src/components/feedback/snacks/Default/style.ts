import { styled } from '../../../../styled';
import { lighten } from 'polished';

export const Wrapper = styled.div`
  position: relative;
  background-color: white;
  padding: 2.5rem 4.5rem 1.5rem 1.5rem;
  box-shadow: rgba(3, 27, 78, 0.15) 0 6px 20px -5px;
  border-radius: 0.8rem;
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
`;

export const TextContainer = styled.div`
  display: flex;
  padding-top: 0.5rem;
  flex-direction: column;
  width: 250px;
  h3 {
    font-weight: 700;
    font-size: 1.725rem;
    margin-bottom: 1rem;
  }
  h5 {
    font-size: 1.325rem;
  }
`;

export const IconContainer = styled.div<{
  variant: 'info' | 'warning' | 'success' | 'error';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  margin-right: 1rem;
  background-color: ${({ variant, theme }): string => lighten(0.3, theme.colors[variant])};
`;

export const ButtonContainer = styled.div`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;

  button {
    width: 100%;
    &:first-child {
      margin-right: 0.5rem;
    }
  }
`;

export const CloseContainer = styled.div`
  position: absolute;
  top: 3rem;
  cursor: pointer;
  right: 1.5rem;
`;
