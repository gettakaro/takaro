import { PageNotFound } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PATHS } from 'paths';
import { AiOutlineBook, AiOutlineMenu, AiOutlineWifi, AiOutlineShop } from 'react-icons/ai';

// TODO: Eventually set this to the correct pages.
const PageNotFoundRedirects = [
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

const NotFound = () => {
  useDocumentTitle('Page not found');
  return <PageNotFound pages={PageNotFoundRedirects} homeRoute={PATHS.home()} />;
};

export default NotFound;
