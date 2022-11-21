import { AlertVariants, styled } from '../../styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: center;
  width: 500px;
  padding: ${({ theme }) => theme.spacing[1]};
`;

export const Description = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  user-select: none;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
  font-size: 1.25rem;
`;

export const ActionContainer = styled.div<{ type: AlertVariants }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  button {
    background-color: ${({ theme, type }) => theme.colors[type]}!important;
  }
`;

export const Cancel = styled.div`
  cursor: pointer;
  user-select: none;
  margin-right: ${({ theme }) => theme.spacing['1_5']};
  font-size: 1.325rem;
  color: ${({ theme }) => theme.colors.gray};
`;

export const Header = styled.div<{ type: AlertVariants }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  user-select: none;
  svg {
    fill: ${({ theme, type }) =>
      type === 'info' ? theme.colors.primary : theme.colors.error};
  }

  h2 {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 2rem;
    color: ${({ theme, type }): string => theme.colors[type]};
    font-weight: 700;
    .icon {
      margin-top: -${({ theme }) => theme.spacing['0_25']};
      margin-right: ${({ theme }) => theme.spacing['2_5']};
      svg {
        fill: ${({ theme, type }): string => theme.colors[type]};
      }
      &::before {
        position: absolute;
        content: '';
        width: 175%;
        height: 175%;
        border-radius: 50%;

        margin: ${({ theme }) => `${theme.spacing[0]} auto`};
        margin: 0 auto;
        top: 0;
        left: 0;
        right: 0;
        background-color: white;
        transform: translateX(-21%) translateY(-21%);
        transition: background-color 0.2s ease-in-out;
      }
    }
  }
`;
