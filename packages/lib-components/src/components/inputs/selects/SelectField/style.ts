import { styled } from '../../../../styled';

export const GroupContainer = styled.ul`
  padding-bottom: ${({ theme }) => theme.spacing['0_75']};
  &:last-child {
    padding-bottom: 0;
  }
`;

export const GroupLabel = styled.li`
  opacity: 0.5;
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['1_5']}`};
  align-items: center;
  justify-content: flex-start;
  display: flex;
  padding-left: ${({ theme }) => theme.spacing['0_25']};

  img,
  svg {
    width: ${({ theme }) => theme.spacing[2]}!important;
    height: ${({ theme }) => theme.spacing[2]}!important;
    margin: 0 !important;
    margin-bottom: 0 !important;
    margin-right: ${({ theme }) => theme.spacing['1']}!important;
    fill: ${({ theme }) => theme.colors.primary};
  }
`;

export const LoadingContainer = styled.div``;
