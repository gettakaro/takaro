import { styled } from '../../../styled';

export const Container = styled.div``;

export const RadioGroupContainer = styled.div`
  margin: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[0]}`};
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing[2]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
  cursor: pointer;
`;

export const Inner = styled.div<{ readOnly: boolean }>``;
