import { styled } from '../../../../styled';

export const Wrapper = styled.div`
  width: 100%;
  min-width: 300px;
  padding: 0 ${({ theme }) => theme.spacing[2]};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
`;

export const DayButton = styled.button<{ isSelected: boolean; isToday: boolean; isSameMonth?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 999999px;
  height: 2rem;
  width: 2rem;
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary : 'transparent')};
  color: white;
  padding: ${({ theme }) => theme.spacing['1']};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
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
