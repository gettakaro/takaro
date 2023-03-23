import { FC } from 'react';
import { motion } from 'framer-motion';
import { errors, styled } from '@takaro/lib-components';
import { Link, useNavigate } from 'react-router-dom';
import {
  AiOutlineLogout as LogOut,
  AiOutlineUser as User,
  AiOutlineSetting as Settings,
} from 'react-icons/ai';

import { useSnackbar } from 'notistack';
import { useAuth } from 'hooks/useAuth';
import { PATHS } from 'paths';

const Container = styled(motion.div)`
  width: 250px;
  min-height: 200px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  position: absolute;
  right: -100px;
  top: 125px;
  box-shadow: 1px 14px 15px -12px #00000023;
  padding: 50px 15px 15px 15px;
  border-radius: 10px;
  z-index: 10;
  cursor: auto;
  h3 {
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: 600;
    text-align: center;
    margin-bottom: 15px;
  }
`;

const HeaderIcon = styled.div`
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.ul`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  svg {
    cursor: pointer;
    fill: ${({ theme }): string => theme.colors.primary};
  }

  li,
  a {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    color: ${({ theme }): string => theme.colors.secondary};
    transition: transform 0.2s ease-in-out;
    p {
      font-size: 1.2rem;
      font-weight: 500;
      margin-left: 10px;
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.background};
      transform: translateX(5px);
    }
  }
`;

export const UserDropDown: FC = () => {
  const { logOut } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  async function handleLogOut() {
    try {
      const loggedOut = await logOut();
      if (loggedOut) {
        enqueueSnackbar('You logged out successfully', { variant: 'default' });
        navigate(PATHS.login());
        return;
      }
      throw new errors.FailedLogOutError('');
    } catch {
      enqueueSnackbar('An error occurred while trying to log out.', {
        variant: 'default',
      });
    }
  }

  return (
    <Container
      animate={{ right: '10px' }}
      transition={{ type: 'spring', bounce: 0.6 }}
    >
      <HeaderIcon>
        <Settings fill="white" size={24} />
      </HeaderIcon>
      <h3>Settings</h3>
      <Content>
        <Link to={PATHS.profile()}>
          <User size={24} /> <p>Profile</p>
        </Link>
        <li onClick={handleLogOut}>
          <LogOut size={24} /> <p>Log out</p>
        </li>
      </Content>
    </Container>
  );
};
