import { styled } from '@takaro/lib-components';
import { FC } from 'react';
import {
  AiOutlineSave,
  AiOutlineHistory,
  AiFillPlusCircle,
} from 'react-icons/ai';
import { IconContext } from 'react-icons';
import { NavLink } from 'react-router-dom';
import { PATHS } from 'paths';

const Container = styled.div`
  height: 100vh;
  background-color: ${({ theme }): string => theme.colors.gray};
  display: flex;
  flex-direction: column;
`;

export const WorkbenchActions: FC = () => {
  return (
    <IconContext.Provider
      value={{ size: '3rem', style: { cursor: 'pointer', marginTop: '1rem' } }}
    >
      <Container>
        <AiOutlineSave />
        <AiOutlineHistory />
        <NavLink to={PATHS.modules.create}>
          <AiFillPlusCircle />
        </NavLink>
      </Container>
    </IconContext.Provider>
  );
};
