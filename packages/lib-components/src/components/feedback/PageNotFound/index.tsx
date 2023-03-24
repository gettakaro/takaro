import { FC, ReactElement, cloneElement } from 'react';
import { Company } from '../../../components';
import { useTheme } from '../../../hooks';
import { styled } from '../../../styled';
import { Link } from 'react-router-dom';
import {
  AiOutlineRight,
  AiOutlineArrowRight as ArrowRightIcon,
} from 'react-icons/ai';

const Container = styled.div`
  width: 700px;
  margin: 0 auto;
  padding: 6rem 0;

  .error {
    margin-top: 6rem;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
  }
  p {
    text-align: center;
    font-size: 1.7rem;
  }

  h3 {
    font-size: 4.125rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: .5rem;
    text-align: center;
  }
  h4 {
    font-weight: 600;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.secondary};
    margin: 10rem 0 1.5rem 0;
  }
  h5 {
    font-size: 1.7rem;
  }

  ul {
    margin-bottom: 1.5rem;
    li {
      position: relative;
      &:first-child {
        border-top: 1px solid ${({ theme }) => theme.colors.gray};
      }

      border-bottom: 1px solid ${({ theme }) => theme.colors.gray};
      width: 100%;
      padding: 2.5rem .5rem;

      a {
        display: flex;
        height: 100%;
        p  {
            font-size: 1.4rem;
          }
        }
      }
    }
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
  `;

const HomeLink = styled(Link)`
  display: flex;
  align-items: center;
  svg {
    margin-left: 1rem;
    fill: ${({ theme }) => theme.colors.primary};
  }
`;

const ChevronRightIcon = styled(AiOutlineRight)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 1rem;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  margin-right: 2rem;
`;

export interface PageNotFoundProps {
  pages?: Page[];
  homeRoute: string;
}

interface Page {
  icon: ReactElement;
  title: string;
  description: string;
  to: string;
}

export const PageNotFound: FC<PageNotFoundProps> = ({ pages, homeRoute }) => {
  const theme = useTheme();

  return (
    <Container>
      <Company />
      <p className="error">404</p>
      <h3>This page does not exist.</h3>
      <p>The page you are looking for could not be found.</p>
      {pages && pages.length && (
        <>
          <h4>Popular pages</h4>
          <ul>
            {pages.map(({ icon, title, description, to }) => (
              <li key={`${title}-${to}`}>
                <Link to={to}>
                  <ChevronRightIcon />
                  <IconContainer>
                    {cloneElement(icon, {
                      size: 24,
                      fill: theme.colors.primary,
                    })}
                  </IconContainer>
                  <div>
                    <h5>{title}</h5>
                    <p>{description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <HomeLink to={homeRoute}>
        Or go back home <ArrowRightIcon />{' '}
      </HomeLink>
    </Container>
  );
};
