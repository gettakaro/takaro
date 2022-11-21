import { styled } from '../../../styled';
import { AiOutlineDown } from 'react-icons/ai';

// this wraps all the options
export const SelectContainer = styled.div`
  margin: ${({ theme }) => theme.spacing[0]};
  box-sizing: border-box;
  list-style-type: none;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing['0_75']};
  outline: 0;
  border: 0.2rem solid ${({ theme }) => theme.colors.primary};
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.elevation[4]};
  user-select: none;
`;

export const SelectButton = styled.div<{ isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  width: 100%;
  font-size: inherit;
  font-family: inherit;
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['1_5']}`};
  outline: 0;
  min-height: 4.3rem;
  border: 2px solid
    ${({ theme, isOpen }) =>
      isOpen ? theme.colors.primary : theme.colors.background};
  border-radius: 0.5rem;
  margin-bottom: ${({ theme }) => theme.spacing['2_5']};

  & > div {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
    font-weight: 600;
  }

  span {
    display: flex;
  }
`;

export const GroupLabel = styled.li`
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[0]}`};
  opacity: 0.5;
  padding: ${({ theme }) => `${theme.spacing[0]} ${theme.spacing['1_5']}`};
`;

export const ArrowIcon = styled(AiOutlineDown)<{ isOpen: boolean }>`
  fill: ${({ theme, isOpen }) =>
    isOpen ? theme.colors.primary : theme.colors.background};
`;

export const ErrorContainer = styled.div<{ showError: boolean }>`
  width: ${({ showError }): string => (showError ? '100%' : '0')};
  background-color: ${({ theme }): string => theme.colors.error};
  transition: width 0.2s ease-in-out, transform 0.3s ease-in-out;
  overflow: hidden;
  border-radius: 0.5rem;
`;

export const Error = styled.span`
  display: flex;
  align-items: center;
  min-width: 100%;
  width: 100%;
  padding: ${({ theme }) =>
    `${theme.spacing['0_5']} ${theme.spacing['0_5']} ${theme.spacing['0_5']} ${theme.spacing['1_5']}`};
  height: 4rem;
  color: white;
  font-weight: 500;
  white-space: nowrap;
`;
