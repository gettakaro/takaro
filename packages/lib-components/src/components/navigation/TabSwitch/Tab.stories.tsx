import { Meta } from '@storybook/react';
import { TabSwitch } from '.';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  width: 50%;
  margin: 0 auto;
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
  </>
);

export const TabSwitchThreeItems = () => (
  <TabSwitch>
    <Tab label="Tab one">this is the first tabs content</Tab>
    <Tab label="Tab two">this is the second tabs content</Tab>
    <Tab label="Tab prev">this is the third tabs content</Tab>
  </TabSwitch>
);

export default {
  title: 'Navigation/TabSwitch',
  component: TabSwitch,
  subcomponents: { TabSwitchTwoItems, TabSwitchThreeItems },
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;
