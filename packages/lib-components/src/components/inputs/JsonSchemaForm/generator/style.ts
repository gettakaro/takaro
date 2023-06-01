import { styled } from '../../../../styled';

export const Form = styled.form`
  /* The scroll container is not showing the buttons compleletely */
  padding-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
