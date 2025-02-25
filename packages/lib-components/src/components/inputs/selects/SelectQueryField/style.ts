import { styled } from '../../../../styled';

export const FeedBackContainer = styled.div`
  display: flex;
  flex-direciton: row;
  align-items: center;
  justify-content: center;

  // loading
  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;
