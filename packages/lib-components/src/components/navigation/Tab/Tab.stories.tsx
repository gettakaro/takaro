import { Meta } from '@storybook/react';
import { TabSwitch } from '.';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
  text-align: left;

  & > div {
    padding: 2px 10px;
  }
`;

const Tab = styled.div<{ label: string }>`
  text-align: center;
`;

export const TabSwitchTwoItems = () => (
  <>
    <TabSwitch color="primary">
      <Tab label="Education">this is the first tabs content</Tab>
      <Tab label="Business">this is the second tabs content</Tab>
    </TabSwitch>

    <TabSwitch color="secondary">
      <Tab label="Education">this is the first tabs content</Tab>
      <Tab label="Business">this is the second tabs content</Tab>
    </TabSwitch>

    <TabSwitch color="gradient">
      <Tab label="Education">this is the first tabs content</Tab>
      <Tab label="Business">this is the second tabs content</Tab>
    </TabSwitch>

    <TabSwitch color="white">
      <Tab label="Education">this is the first tabs content</Tab>
      <Tab label="Business">this is the second tabs content</Tab>
    </TabSwitch>
  </>
);

export const TabSwitchThreeItems = () => (
  <TabSwitch>
    <Tab label="Tab 1">this is the first tabs content</Tab>
    <Tab label="Tab 2">this is the second tabs content</Tab>
    <Tab label="Tab 3">this is the third tabs content</Tab>
  </TabSwitch>
);

export default {
  title: 'Navigation/TabList',
  component: TabSwitch,
  subcomponents: { TabSwitchTwoItems, TabSwitchThreeItems },
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;
