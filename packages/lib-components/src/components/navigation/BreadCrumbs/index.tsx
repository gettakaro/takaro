import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '../../../styled';

const Crumbs = styled.div`
  & > * {
    display: inline-block;
    margin-right: ${({ theme }) => theme.spacing['0_5']};
  }

  div {
    a {
      &:hover {
        color: ${({ theme }) => theme.colors.primary};
      }
      text-transform: capitalize;
    }

    &:after {
      content: '/';
      margin-left: ${({ theme }) => theme.spacing['0_5']};
    }
    &:last-child:after {
      display: none;
    }
  }
`;

interface BreadCrumbsProps {
  // Ids in links are not user friendly, so we can provide a map to display a more user friendly name.
  idToNameMap?: Record<string, string>;
}

export const BreadCrumbs: FC<BreadCrumbsProps> = ({ idToNameMap = {} }) => {
  const location = useLocation();
  let currentLink = '';

  const crumbs = location.pathname
    .split('/')
    .filter((crumb) => crumb !== '')
    .map((crumb) => {
      currentLink += `/${crumb}`;

      console.log(idToNameMap);
      const displayName = idToNameMap[crumb] || crumb;

      return (
        <div key={crumb}>
          <Link to={currentLink}>{displayName}</Link>
        </div>
      );
    });

  return <>{crumbs.length > 1 && <Crumbs>{crumbs}</Crumbs>}</>;
};
