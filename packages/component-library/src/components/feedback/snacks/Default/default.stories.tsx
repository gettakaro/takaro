import { Meta, Story } from '@storybook/react';
import { useSnackbar } from 'notistack';
import { styled } from '../../../../styled';
import { Button } from '../../..';
import { FaChartArea as CustomIcon } from 'react-icons/fa';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;

export default {
  title: 'Feedback/Snacks/Default',
  component: undefined
} as Meta;

export const Snacks: Story = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (
    <Wrapper>
      <button
        onClick={() => {
          enqueueSnackbar('A new software version is available for download.', {
            key: 'software-update',
            variant: 'default',
            title: 'Update available',
            button1: (
              <Button
                onClick={() => {
                  /* dummy*/
                }}
                text="Update"
              />
            ),
            button2: (
              <Button
                onClick={() => {
                  closeSnackbar('software-update');
                }}
                text="Not now"
                variant="outline"
              />
            )
          });
        }}
      >
        Info
      </button>
      <button
        onClick={() => {
          enqueueSnackbar('file was uploaded successfully', {
            type: 'success',
            title: ' Upload successful',
            button1: (
              <Button
                color="success"
                onClick={() => {
                  /* dummy*/
                }}
                text="Show report"
                variant="outline"
              />
            )
          });
        }}
      >
        Success
      </button>
      <button
        onClick={() => {
          enqueueSnackbar('Warning message', { type: 'warning' });
        }}
      >
        Warning
      </button>
      <button
        onClick={() => {
          enqueueSnackbar<'default'>('Error message with custom icon', {
            type: 'error',
            icon: <CustomIcon />
          });
        }}
      >
        Error
      </button>
    </Wrapper>
  );
};
