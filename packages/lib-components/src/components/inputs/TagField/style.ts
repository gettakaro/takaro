import { Chip } from '../../data/Chip';
import { styled } from '../../../styled';

export const Container = styled.div``;

export const TagsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['0_5']} 0 ${theme.spacing['0_5']}`};
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing['0_75']};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  input {
    display: inline;
    width: 100%;
    padding-top: 0;
    border-radius: 0;
  }
`;

export const Tag = styled(Chip)``;
