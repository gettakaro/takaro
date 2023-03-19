import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@takaro/lib-components';
import { AiFillPlusCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';

const GameServers: FC = () => {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Helmet>
        <title>Gameservers - Takaro</title>
      </Helmet>
      <Button
        icon={<AiFillPlusCircle size={20} />}
        onClick={() => {
          navigate(PATHS.gameServers.create);
        }}
        text="Add gameserver"
      />
      todo
    </Fragment>
  );
};

export default GameServers;
