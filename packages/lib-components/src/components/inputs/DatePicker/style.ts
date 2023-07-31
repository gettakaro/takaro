import { styled } from '../../../styled';

export const RefContainer = styled.div<{
  readOnly: boolean;
  isOpen: boolean;
  hasError: boolean;
}>`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'pointer')};
  font-family: inherit;
  outline: 0;
  font-weight: 500;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1']}`};
  text-transform: capitalize;
  border: 0.1rem solid
    ${({ theme, isOpen, hasError }) => {
      if (hasError) return theme.colors.error;
      return isOpen ? theme.colors.primary : theme.colors.background;
    }};

  &:focus {
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }
`;

export const Wrapper = styled.div`
  width: 100%;
  min-width: 300px;
  padding: 0 ${({ theme }) => theme.spacing[2]};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
`;

export const CalendarContainer = styled.div``;

export const DayButton = styled.button<{ isSelected: boolean; isToday: boolean; isSameMonth?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  background-color: transparent;
  color: white;
`;

export const DayOfWeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing['1_5']};
  color: ${({ theme }) => theme.colors.textAlt};
`;

export const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  line-height: 1.5;
`;

export const DayWrapper = styled.div<{ dayNumber: number; isFirstDay: boolean }>`
  ${({ dayNumber, isFirstDay }) => isFirstDay && `grid-column-start: ${dayNumber};`}
  padding: ${({ theme }) => `${theme.spacing['1']} 0`};
`;
