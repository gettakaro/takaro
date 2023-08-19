import { styled } from '@takaro/lib-components';

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ListItem = styled.li<{ isBranch?: boolean }>`
  margin-left: ${({ isBranch, theme }) => (isBranch ? '0' : theme.spacing[2])};
  margin-bottom: ${({ isBranch, theme }) => (isBranch ? theme.spacing[1] : theme.spacing['0_75'])};
`;

export const ListItemHeader = styled.div<{ isBranch?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ isBranch, theme }) => (isBranch ? theme.spacing['0_75'] : theme.spacing['0_25'])};
`;

export const ListItemName = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const ClearButton = styled.a`
  color: ${({ theme }) => theme.colors.textAlt};
  text-decoration: underline;
  cursor: pointer;
`;

export const Wrapper = styled.div`
  max-width: 300px;
`;
