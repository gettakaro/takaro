import { FC } from 'react';
import { Divider, Tabs } from '../../../../components';
import { useDatePickerContext, useDatePickerDispatchContext } from '../Context';
import { styled } from '../../../../styled';
import { GenericTextField } from '../../TextField/Generic';
import { Absolute } from './Absolute';
import { Relative } from './Relative';

const Wrapper = styled.div`
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[1]} 0 ${theme.spacing[1]}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

interface DateSelectorProps {
  isStart: boolean;
}

export const DateSelector: FC<DateSelectorProps> = ({ isStart }) => {
  const dispatch = useDatePickerDispatchContext();
  const state = useDatePickerContext();

  if (!dispatch || !state) {
    throw new Error('useDatePickerDispatchContext and useDatePickerContext must be used within a DatePickerProvider');
  }

  return (
    <Tabs defaultValue="absolute">
      <Tabs.List>
        <Tabs.Trigger value="absolute">Absolute</Tabs.Trigger>
        <Tabs.Trigger value="relative">Relative</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="absolute">
        <Wrapper>
          <Absolute isStart={isStart} />
        </Wrapper>
      </Tabs.Content>
      <Tabs.Content value="relative">
        <Wrapper>
          <Relative isStart={isStart} />
          <GenericTextField
            hasDescription={false}
            hasError={false}
            name={`date-preview-${isStart}`}
            id={`date-preview-${isStart}`}
            onChange={() => {}}
            readOnly={true}
            value={
              isStart
                ? state.start.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')
                : state.end.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')
            }
          />
          <Divider fullWidth />
          {/* todo: add option to round selected unit */}
        </Wrapper>
      </Tabs.Content>
    </Tabs>
  );
};
