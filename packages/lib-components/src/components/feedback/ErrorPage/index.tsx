import { FC, ReactElement, cloneElement } from 'react';
import { Company } from '../../../components';
import { useTheme } from '../../../hooks';
import { styled } from '../../../styled';
import { Link } from '@tanstack/react-router';
import {
  AiOutlineBook,
  AiOutlineMenu,
  //AiOutlineWifi,
  AiOutlineRight,
  AiOutlineArrowRight as ArrowRightIcon,
  //AiOutlineShop,
} from 'react-icons/ai';

const Container = styled.div`
  width: 700px;
  margin: 0 auto;
  padding: 6rem 0;
  
  p {
    font-size: 1.7rem;
    text-align: center;
    color: ${({ theme }) => theme.colors.textAlt};

    &.error {
      margin-top: ${({ theme }) => theme.spacing[6]};
      color: ${({ theme }) => theme.colors.primary};
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: 600;
      text-align: center;
    }
  }

  h3 {
    font-size: 4.125rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: .5rem;
    text-align: center;
  }
  h4 {
    font-weight: 600;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.textAlt};
    margin: 3rem 0 1.5rem 0;
  }
  h5 {
    font-size: 1.7rem;
  }

  ul {
    margin-bottom: 1.5rem;
    li {
      position: relative;
      &:first-child {
        border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
      }

      border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
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

const HomeLink = styled((props) => <Link {...props} />)`
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

export interface ErrorPageProps {
  listItems?: ListItem[];
  homeRoute: string;
  title: string;
  description: string;
  errorCode: number;
}

interface ListItem {
  icon: ReactElement;
  title: string;
  description: string;
  to: string;
}

const defaultListItems = [
  {
    icon: <AiOutlineBook />,
    title: 'Documentation',
    description: 'Learn how to integrate our tools with your app',
    to: 'https://docs.takaro.io',
  },
  {
    icon: <AiOutlineMenu />,
    title: 'Api reference',
    description: 'A complete API reference for our libraries',
    to: 'https://api.takaro.io/api.html',
  },
  /*
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
  */
];

export const ErrorPage: FC<ErrorPageProps> = ({
  listItems = defaultListItems,
  homeRoute,
  title,
  description,
  errorCode,
}) => {
  const theme = useTheme();

  return (
    <Container>
      <Company />
      <p className="error">{errorCode}</p>
      <h3>{title}</h3>
      <p>{description}</p>
      {listItems && listItems.length && (
        <>
          <h4>Popular pages</h4>
          <ul>
            {listItems.map(({ icon, title, description, to }) => (
              <li key={`${title}-${to}`}>
                <a href={to}>
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
                </a>
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
