import { styled } from '../../../styled';

export const Container = styled.div`
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const InputContainer = styled.div<{ fields: number }>`
  display: grid;
  margin: 2.5rem 0;
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
  border: 2px solid
    ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.background)};

  /* Disable arrow up and down */
  -moz-appearance: textfield;
  &::webkit-inner-spin-button {
    display: none;
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    border: 2px solid
      ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }
`;

export const ErrorContainer = styled.div`
  min-height: 40px;
  display: flex;
  align-items: center;
  height: auto;
  background-color: ${({ theme }): string => theme.colors.error};
  transition: width 0.2s ease-in-out, transform 0.3s ease-in-out;
  overflow: hidden;
  border-radius: 5px;
  z-index: 5;
  margin-bottom: 1.5rem;
`;

export const Error = styled.span`
  display: flex;
  align-items: center;
  min-width: 100%;
  width: 100%;
  padding: 1rem 1rem 1rem 1rem;
  height: 4rem;
  color: white;
  font-weight: 500;
  white-space: nowrap;
`;
