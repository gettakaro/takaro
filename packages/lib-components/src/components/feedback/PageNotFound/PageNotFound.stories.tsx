import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { PageNotFound, PageNotFoundProps } from '.';
import {
  AiOutlineBook,
  AiOutlineMenu,
  AiOutlineWifi,
  AiOutlineShop,
} from 'react-icons/ai';

export default {
  title: 'Views/PageNotFound',
  component: PageNotFound,
} as Meta;

export const Default: StoryFn<PageNotFoundProps> = () => {
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
    },
  ];
  return <PageNotFound pages={pages} homeRoute="/" />;
};
