import { Tabs } from '../../../../components';
import { Calendar } from '../Calendar';

export const DateSelector = () => {
  return (
    <Tabs defaultValue="absolute">
      <Tabs.List>
        <Tabs.Trigger value="absolute">Absolute</Tabs.Trigger>
        <Tabs.Trigger value="relative">Relative</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="absolute">
        <Calendar isBegin />
      </Tabs.Content>
      <Tabs.Content value="relative">
        <div>relative</div>
      </Tabs.Content>
    </Tabs>
  );
};
