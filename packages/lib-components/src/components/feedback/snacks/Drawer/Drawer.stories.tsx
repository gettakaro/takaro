import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button } from '../../../';
import { useSnackbar } from 'notistack';
import { styled } from '../../../../';
import { AiFillCheckCircle as CheckMarkIcon } from 'react-icons/ai';

const CustomContent = styled.div`
  h4 {
    font-size: 1.2rem;
  }
  p {
    display: flex;
    align-items: center;
    svg {
      margin-right: 0.5rem;
    }
  }
`;

export default {
  title: 'Feedback/Snacks/DrawerSnack',
  component: undefined,
} as Meta;

export const Downloads: StoryFn = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showSnack = () => {
    enqueueSnackbar('Report Complete', {
      autoHideDuration: 20000, // 20s
      anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
      variant: 'drawer',
      children: (
        <CustomContent>
          <h4>Pdf Ready</h4>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckMarkIcon /> Download now
          </p>
        </CustomContent>
      ),
    });
  };

  return <Button onClick={() => showSnack()}>Show snack</Button>;
};
