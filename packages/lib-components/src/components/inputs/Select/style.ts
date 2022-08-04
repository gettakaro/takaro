import { styled } from '../../../styled';

export const Container = styled.div`
  width: fit-content;
  min-width: 100px;
  margin-bottom: 1rem;
  select {
    display: none;
  }
  label {
    margin-bottom: 0.5rem;
    margin-right: 1rem;
    cursor: pointer;
  }
`;

export const IconContainer = styled.div`
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SelectedContainer = styled.div<{
  hasError: boolean;
  hasIcon: boolean;
}>`
  position: relative;
  display: inline-block;
  padding: 0.75rem 3.5rem 0.75rem
    ${({ hasIcon }): string => (hasIcon ? '3.5rem' : '1.225rem')};
  border: 2px solid
    ${({ theme, hasError }): string =>
      hasError ? theme.colors.error : theme.colors.gray};
  border-radius: 0.2rem;
  background-color: white;
  color: white;
  font-size: 1.3rem;
  text-align: center;
  font-weight: 600;
  cursor: pointer;

  p {
    color: black;
  }

  &:focus,
  &:hover {
    border-color: ${({ theme, hasError }): string =>
      hasError ? theme.colors.error : theme.colors.primary};

    svg {
      fill: ${({ theme }) => theme.colors.primary};
    }
  }
  &::placeholder {
    text-transform: capitalize;
    font-weight: 600;
    color: white;
  }

  &.read-only {
    opacity: 0.5;
  }
`;

export const ArrowContainer = styled.div`
  position: absolute;
  right: 0.7rem;
  top: 55%;
  transform: translateY(-50%);
`;

export const DropDownContainer = styled.div`
  width: 350px;
  white-space: nowrap;
  border: 1px solid ${({ theme }): string => theme.colors.gray};
  border-radius: 0.5rem;
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Option = styled.div<{ selected: boolean }>`
  position: relative;
  display: block;
  white-space: nowrap;
  padding: 1.225rem 4.5rem 1.225rem 1.2rem;
  cursor: pointer;
  background-color: white;
  color: black;

  &:first-child {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  &:last-child {
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }

  &:hover {
    span {
      color: white;
    }
    background-color: ${({ theme }): string => theme.colors.primary};
    svg {
      fill: white;
    }
  }
`;

export const CheckMarkContainer = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 52%;
  transform: translateY(-50%);

  svg {
    fill: ${({ theme }): string => theme.colors.primary};
  }
`;
