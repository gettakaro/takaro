import { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { ProgressBar, ProgressBarProps } from '.';
import { styled } from '../../../styled';

const ButtonContainer = styled.div`
  display: flex;
  button {
    &:first-child {
      margin: 0 1rem;
    }
  }
`;

export default {
  title: 'Feedback/ProgressBar',
  component: ProgressBar
} as Meta;

export const Determinate: Story<ProgressBarProps> = () => {
  const [value, setValue] = useState<number>(0);

  return (
    <>
      <ProgressBar mode="determinate" showValue value={value} />
      <ButtonContainer>
        <button onClick={() => setValue(value + 5)}>+5</button>
        <button onClick={() => setValue(value + 10)}>+10</button>
      </ButtonContainer>
    </>
  );
};

export const InDeterminate: Story<ProgressBarProps> = () => (
  <ProgressBar mode="indeterminate" />
);
