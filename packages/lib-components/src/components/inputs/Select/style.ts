import { styled } from '../../../styled';
import { AiOutlineDown } from 'react-icons/ai';

// this wraps all the options
export const SelectContainer = styled.div`
  margin: 0;
  box-sizing: border-box;
  list-style-type: none;
  overflow-y: auto;
  padding: 0.8rem;
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
  padding: 0.5rem 1.5rem;
  min-height: 4.3rem;
  border: 2px solid
    ${({ theme, isOpen }) =>
      isOpen ? theme.colors.primary : theme.colors.background};
  border-radius: 0.5rem;
  margin-bottom: 2.5rem;

  & > div {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  }

  span {
    display: flex;
  }
`;

export const GroupLabel = styled.li`
  margin: 5px 0;
  opacity: 0.5;
  padding: 0 15px;
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
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
  height: 4rem;
  color: white;
  font-weight: 500;
  white-space: nowrap;
`;

export const LabelContainer = styled.div`
  width: 100%;
  margin-bottom: 0.5rem;
`;

export const Label = styled.label<{ showError: boolean }>`
  color: ${({ theme, showError }): string =>
    showError ? theme.colors.error : theme.colors.text};
  width: 100%;
  user-select: none;
  font-size: 1.4rem;
  font-weight: 500;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 1rem;
    color: ${({ theme, showError }): string =>
      showError ? theme.colors.error : theme.colors.text};
  }
`;
