import { styled } from '../../../../styled';

export const FeedBackContainer = styled.div`
  display: flex;
  flex-direciton: row;
  align-items: center;
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing['1']};

  // loading
  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;
