import { FloatingOverlay } from '@floating-ui/react';
import { styled } from '../../../styled';

// This wraps everything
export const Container = styled.div`
  display: relative;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

export const SelectButton = styled.div<{ readOnly: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'pointer')};
  font-family: inherit;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1_5']}`};
  outline: 0;
  position: relative;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 0.1rem solid ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 500;
  text-transform: capitalize;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  & > div {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
  }

  span {
    display: flex;
  }
`;

export const StyledFloatingOverlay = styled(FloatingOverlay)`
  width: 100%;
  height: 100%;
`;

export const SelectContainer = styled.div`
  list-style-type: none;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing['0_75']};
  outline: 0;
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: ${({ theme }) => theme.elevation[4]};
  text-transform: capitalize;
`;

export const GroupLabel = styled.li`
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[0]}`};
  opacity: 0.5;
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['1_5']}`};
`;
