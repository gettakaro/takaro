import { styled } from '../../../../styled';
import { lighten } from 'polished';

export const Wrapper = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) =>
    `${theme.spacing['2_5']} ${theme.spacing[6]} ${theme.spacing['1_5']} ${theme.spacing['1_5']}`};
  box-shadow: ${({ theme }) => theme.elevation[4]};
  border-radius: 0.8rem;
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 250px;
  h3 {
    font-weight: 700;
    font-size: 1.725rem;
    margin-bottom: ${({ theme }) => theme.spacing[1]};
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
  padding: ${({ theme }) => theme.spacing['0_5']};
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing[1]};
  background-color: ${({ variant, theme }): string =>
    lighten(0.3, theme.colors[variant])};
`;

export const ButtonContainer = styled.div`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;

  button {
    width: 100%;
    &:first-child {
      margin-right: ${({ theme }) => theme.spacing['0_5']};
    }
  }
`;

export const CloseContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing['3']};
  cursor: pointer;
  right: ${({ theme }) => theme.spacing['2']};
`;
