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
  position relative;
  margin: ${({ theme }) => `${theme.spacing['2_5']} auto`};
  grid-gap: 1rem;
  grid-template-columns: repeat(${({ fields }) => fields}, 60px);
`;

export const LoadingField = styled.div`
  width: 100%;
  border-radius: 1rem;
  height: 60px;
`;

export const Input = styled.input<{ hasError: boolean; isDisabled: boolean }>`
  width: 100%;
  font-size: 3rem;
  border-radius: 1rem;
  text-align: center;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
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
