import { Meta, Story } from '@storybook/react';
import { Error404, Error404Props } from '.';
import { AiOutlineBook, AiOutlineMenu, AiOutlineWifi, AiOutlineShop } from 'react-icons/ai';

export default {
  title: 'Views/Error404',
  component: Error404
} as Meta;

export const Default: Story<Error404Props> = () => {
  const pages = [
    {
      icon: <AiOutlineBook />,
      title: 'Documentation',
      description: 'Learn how to integrate our tools with your app',
      to: '',
    },
    {
      icon: <AiOutlineMenu />,
      title: 'Api reference',
      description: 'A complete API reference for our libraries',
      to: '',
    },
    {
      icon: <AiOutlineWifi />,
      title: 'Guides',
      description: 'Installation guides that cover popular setups',
      to: '',
    },
    {
      icon: <AiOutlineShop />,
      title: 'Blog',
      description: 'Read our latest news and articles',
      to: '',
    }
  ];
  return <Error404 pages={pages} homeRoute="/" />;
};
