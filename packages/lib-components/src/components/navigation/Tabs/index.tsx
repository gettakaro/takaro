import { PropsWithChildren, FC } from 'react';
import { Trigger } from './Trigger';
import { Content } from './Content';
import { List } from './List';
import { useTabs } from './useTabs';
import { TabsContext } from './Context';
import { styled } from '../../../styled';

const Container = styled.div``;

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // activitationMode?: 'automatic' | 'manual';
}

interface SubComponents {
  Trigger: typeof Trigger;
  Content: typeof Content;
  List: typeof List;
}

export const Tabs: FC<PropsWithChildren<TabsProps>> & SubComponents = ({ children, ...rest }) => {
  const tabs = useTabs(rest);
  return (
    <TabsContext.Provider value={tabs}>
      <Container>{children}</Container>
    </TabsContext.Provider>
  );
};

Tabs.Trigger = Trigger;
Tabs.Content = Content;
Tabs.List = List;
