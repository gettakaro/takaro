import { Chip } from '../../../components';
import { styled } from '../../../styled';

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  width: fit-content;
  padding: 0.5rem 1rem;
  display: flex;
  gap: 1rem;
`;

export const Tag = styled(Chip)``;
