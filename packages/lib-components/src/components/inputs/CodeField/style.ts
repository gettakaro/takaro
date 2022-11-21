import { styled } from '../../../styled';

export const Container = styled.div`
  margin: ${({ theme }) => `${theme.spacing[0]} auto`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const InputContainer = styled.div<{ fields: number }>`
  display: grid;
  margin: ${({ theme }) => `${theme.spacing['2_5']} auto`};
  grid-gap: 1rem;
  grid-template-columns: repeat(${({ fields }) => fields}, 60px);
`;

export const LoadingField = styled.div`
  width: 100%;
  border-radius: 1rem;
  height: 60px;
`;

export const Input = styled.input<{ hasError: boolean }>`
  width: 100%;
  font-size: 3rem;
  border-radius: 1rem;
  text-align: center;
  border: 0.2rem solid
    ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.background};

  /* Disable arrow up and down */
  -moz-appearance: textfield;
  &::webkit-inner-spin-button {
    display: none;
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;

    margin: ${({ theme }) => theme.spacing[0]};
  }

  &:focus {
    border: 0.2rem solid
      ${({ theme, hasError }) =>
        hasError ? theme.colors.error : theme.colors.primary};
  }
`;

export const ErrorContainer = styled.div`
  min-height: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  height: auto;
  background-color: ${({ theme }): string => theme.colors.error};
  transition: width 0.2s ease-in-out, transform 0.3s ease-in-out;
  overflow: hidden;
  border-radius: 0.5rem;
  z-index: 5;
  margin-bottom: ${({ theme }) => theme.spacing['1_5']};
`;

export const Error = styled.span`
  display: flex;
  align-items: center;
  min-width: 100%;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[1]};
  height: ${({ theme }) => theme.spacing[5]};
  color: white;
  font-weight: 500;
  white-space: nowrap;
`;
