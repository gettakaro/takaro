import { FC } from 'react';
import { DateTime } from 'luxon';
import { styled } from '../../../../styled';

const List = styled.ul`
  display: flex;
  flex-direction: column;
  width: fit-content;
  flex-grow: 1;
  align-items: center;
  height: 100%;
  gap: ${({ theme }) => theme.spacing['0_5']};
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing['1']}`};
  scrollbar-width: thin;
  scrollbar-color: #69707d80 #0000;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const Item = styled.li<{ isSelected: boolean }>`
  cursor: pointer;
  background-color: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary : 'transparent')};
  padding: ${({ theme }) => theme.spacing['0_5']};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

export interface TimePickerProps {
  onChange: (date: DateTime) => void;
  selectedDate: DateTime;
}

export const TimePicker: FC<TimePickerProps> = ({ onChange, selectedDate }) => {
  let date = selectedDate.startOf('day');

  return (
    <List role="listbox">
      {Array.from({ length: 48 }).map(() => {
        const nextTime = date.plus({ minutes: 30 });
        const formattedTime = date.toFormat('HH:mm');
        const isSelected = date.hasSame(selectedDate, 'hour') && date.hasSame(selectedDate, 'minute');
        const returnValue = date;
        date = nextTime;
        return (
          <Item isSelected={isSelected} key={formattedTime} role="option" onClick={() => onChange(returnValue)}>
            {formattedTime}
          </Item>
        );
      })}
    </List>
  );
};
