import { FloatingDelayGroup } from '@floating-ui/react';
import { Meta, StoryFn } from '@storybook/react';
import { Tooltip, TooltipProps } from '.';
import { styled } from '../../../styled';

const Container = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

export default {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  args: {
    placement: 'bottom',
    label: 'I am the label',
  },
} as Meta<TooltipProps>;

export const Default: StoryFn<TooltipProps> = (args) => (
  <Tooltip {...args}>
    <a>I am content with a tooltip</a>
  </Tooltip>
);

export const Group: StoryFn<TooltipProps> = () => (
  <Container>
    If you go fast from one button to another you'll notice that the tooltip
    shows immediately and ignores the initial delay
    <FloatingDelayGroup delay={{ open: 1000, close: 200 }}>
      <Tooltip label="Tooltip one">
        <button>Hover me</button>
      </Tooltip>
      <Tooltip label="Tooltip two">
        <button>Hover me</button>
      </Tooltip>
      <Tooltip label="Tooltip three">
        <button>Hover me</button>
      </Tooltip>
    </FloatingDelayGroup>
  </Container>
);
