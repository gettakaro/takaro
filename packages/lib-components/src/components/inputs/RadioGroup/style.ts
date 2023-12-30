import { styled } from '../../../styled';

export const FieldSet = styled.fieldset`
  display: block;
  margin: 0;
  padding: 0;
  border: none;
  font-size: ${({ theme }) => theme.fontSize.medium};
`;

export const Container = styled.div`
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
