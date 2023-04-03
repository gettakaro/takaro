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

export const BreadCrumbs = () => {
  const location = useLocation();
  let currentLink = '';

  const crumbs = location.pathname
    .split('/')
    .filter((crumb) => crumb !== '')
    .map((crumb) => {
      currentLink += `/${crumb}`;
      return (
        <div key={crumb}>
          <Link to={currentLink}>{crumb}</Link>
        </div>
      );
    });

  return <>{crumbs.length > 1 && <Crumbs>{crumbs}</Crumbs>}</>;
};
