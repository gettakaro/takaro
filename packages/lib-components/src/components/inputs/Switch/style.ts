import { styled } from '../../../styled';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};
`;

export const Input = styled.input<{ hasError: boolean; hasDescription: boolean }>`
  position: relative;
  display: inline-block;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  height: 2.475rem;
  width: 4.125rem;
  vertical-align: middle;
  border-radius: 3rem;
  box-shadow: 0px 1.5px 4.5px ${({ theme }) => theme.colors.backgroundAccent}33 inset;
  transition: 0.25s linear background;
  cursor: pointer;

  ::before {
    content: '';
    display: block;
    width: 1.875rem;
    height: 1.875rem;
    background: #fff;
    border-radius: 1.8rem;
    position: absolute;
    top: 0.3rem;
    left: 0.25rem;
    box-shadow: 0px 1.5px 4.5px ${({ theme }) => theme.colors.backgroundAccent}30;
    transition: 0.2s ease-in-out transform;
    transform: translateX(0rem);
  }

  :focus-visible {
    outline: 2px solid dodgerblue;
    outline-offset: 2px;
  }

  :focus {
    outline: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  }

  :disabled {
    background: ${({ theme }) => theme.colors.disabled};
  }

  :checked {
    background: ${({ theme }) => theme.colors.primary};

    :disabled {
      background: ${({ theme }) => theme.colors.disabled};
    }

    ::before {
      transform: translateX(1.5rem);
    }
  }
`;
