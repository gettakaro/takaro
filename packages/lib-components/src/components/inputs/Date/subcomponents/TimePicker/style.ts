import { shade } from 'polished';
import { styled } from '../../../../../styled';

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  width: fit-content;
  flex-grow: 1;
  align-items: center;
  height: 100%;
  gap: ${({ theme }) => theme.spacing['0_5']};
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing['0_75']}`};
  scrollbar-width: thin;
  scrollbar-color: #69707d80 #0000;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
`;

export const Item = styled.li<{ isSelected: boolean }>`
  cursor: pointer;
  background-color: ${({ theme, isSelected }) => (isSelected ? shade(0.5, theme.colors.primary) : 'transparent')};
  border: 1px solid ${({ theme, isSelected }) => (isSelected ? theme.colors.primary : 'transparent')};
  padding: ${({ theme }) => theme.spacing['0_5']};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected ? shade(0.5, theme.colors.primary) : theme.colors.background};
  }
`;
