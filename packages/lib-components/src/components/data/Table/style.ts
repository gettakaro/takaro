import { styled } from '../../../styled';
import { AiOutlineArrowDown } from 'react-icons/ai';

export const Wrapper = styled.div<{ refetching: boolean }>`
  width: 100%;
  overflow-x: auto;
`;

interface AscDescIconProps {
  sorting: 'asc' | 'desc';
}

export const AscDescIcon = styled(AiOutlineArrowDown)<AscDescIconProps>`
  fill: ${({ theme }) => theme.colors.primary};
  rotate: ${({ sorting }) => (sorting === 'asc' ? 0 : 180)}deg;
`;
