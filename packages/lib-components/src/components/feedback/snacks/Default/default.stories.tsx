import * as React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useSnackbar } from 'notistack';
import { styled } from '../../../../styled';
import { Button } from '../../../../components';
import { DefaultSnackProps } from '.';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;

export default {
  title: 'Feedback/Snacks/Default',
  parameters: {
    docs: {
      inlineStories: false,
    },
  },
  args: {
    type: 'info',
    title: 'Update available',
    message: 'A new software version is available for download.',
  },
} as Meta<DefaultSnackProps>;

export const Default: StoryFn<DefaultSnackProps> = (args) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleOnClick = () => {
    enqueueSnackbar(args.message, {
      title: args.title,
      type: args.type,
      key: 'software-update',
    });
  };

  return (
    <Wrapper>
      <Button onClick={handleOnClick}>show snack</Button>
    </Wrapper>
  );
};

export const Buttons: StoryFn<DefaultSnackProps> = (args) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleOnClick = () => {
    enqueueSnackbar(args.message, {
      title: args.title,
      type: args.type,
      key: 'software-update',
      button1: <Button>Update</Button>,
      button2: (
        <Button
          onClick={() => {
            closeSnackbar('software-update');
          }}
          variant="outline"
        >
          Not now
        </Button>
      ),
    });
  };

  return (
    <Wrapper>
      <Button onClick={handleOnClick}>show snack</Button>
    </Wrapper>
  );
};
