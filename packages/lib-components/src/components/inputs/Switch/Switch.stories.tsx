import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { Switch, SwitchProps } from '.';
import { useForm } from 'react-hook-form';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 0.5rem 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
  text-align: center;

  & > div {
    margin: 0 auto;
    padding: 2px 10px;
  }
`;

export default {
  title: 'Inputs/Switch',
  component: Switch,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;

const Template: Story<SwitchProps> = (args) => {
  const { control } = useForm();
  return (
    <div>
      <Switch {...args} control={control} />
    </div>
  );
};

// Default Button
export const Default = Template.bind({});
Default.args = { name: 'switch01' };
// Checked by default
export const DefaultChecked = Template.bind({});
DefaultChecked.args = { name: 'switch02', defaultValue: true };
// Loading Switch
export const Loading = Template.bind({});
Loading.args = { name: 'switch03' };

/* TODO: bigger example
export const Examples = () => {

  type FormFields = {
    isMale: string;
  }

  const onSubmit: SubmitHandler<FormFields> = ({ isMale }) => {
    // Do something with form data
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>Default</h3>
      <h3>Disabled</h3>
      <h3>Checked by default </h3>
      <div>
        <Switch name="switch01" />
      </div>
      <div>
        <Switch disabled name="switch02" />
      </div>
      <div>
        <Switch defaultChecked name="switch03" />
      </div>
    </form>
  );
};
*/
