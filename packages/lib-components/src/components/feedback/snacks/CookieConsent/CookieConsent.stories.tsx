import { Meta, Story } from '@storybook/react';
import { useSnackbar } from 'notistack';

export default {
  title: 'Feedback/Snacks/CookieConsent',
  component: undefined
} as Meta;

export const Snacks: Story = () => {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <button
      onClick={() => {
        enqueueSnackbar('', {
          variant: 'cookieConsent',
          persist: true
        });
      }}
    >
      Info
    </button>
  );
};
