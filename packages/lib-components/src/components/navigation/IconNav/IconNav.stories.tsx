import { Meta } from '@storybook/react';
import { IconNav } from '.';
import type { IconNavProps} from '.';
import { styled } from '../../../styled';
import { AiFillFile as FileIcon, AiFillSetting as SettingsIcon } from 'react-icons/ai';


const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  padding: 0 5rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

export default {
  title: 'Navigation/IconNav',
  component: IconNav,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta<IconNavProps>;

export const Default = () => {
  
  const navigation: IconNavProps['items'] = [
    {
      icon: <FileIcon/>,
      title: 'Explorer',
      to: '/explorer',
    },
    {
      icon: <SettingsIcon/>,
      title: 'Settings',
      to: '/settings',
    },
  ];


  return (
    <IconNav items={navigation} />
  );
};
