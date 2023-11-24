import { styled, Dialog } from '@takaro/lib-components';

export const StyledDialogBody = styled(Dialog.Body)`
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;

/* NOTE: if this is needed somewhere else it should be moved into lib-components */
export const SocialContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const Social = styled.div``;
