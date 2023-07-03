import { styled } from '../../../styled';

export const FieldSet = styled.fieldset`
  display: block;
  margin: 0;
  padding: 0;
  border: none;
  font-size: ${({ theme }) => theme.fontSize.medium};
`;

export const Container = styled.div<{ isSelected: boolean }>`
  margin: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[0]}`};
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ isSelected, theme }) => (isSelected ? theme.colors.backgroundAlt : theme.colors.background)};
  padding: ${({ theme }) => theme.spacing[2]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
  cursor: pointer;
`;
