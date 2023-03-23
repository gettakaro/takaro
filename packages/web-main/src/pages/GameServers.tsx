import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@takaro/lib-components';
import { AiFillPlusCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const GameServers: FC = () => {
  return (
    <Fragment>
      <Helmet>
        <title>Gameservers - Takaro</title>
      </Helmet>
      <Button
        icon={<AiFillPlusCircle size={20} />}
        onClick={() => {}}
        text="Add gameserver"
      />
      todo
    </Fragment>
  );
};

export default GameServers;
