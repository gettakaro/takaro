import { styled } from '../../../../styled';

export const Form = styled.form`
  /* The scroll container is not showing the buttons compleletely */
  padding-bottom: ${({ theme }) => theme.spacing[4]};

  button[type='button'] {
    margin-bottom: 1rem;
  }
`;
