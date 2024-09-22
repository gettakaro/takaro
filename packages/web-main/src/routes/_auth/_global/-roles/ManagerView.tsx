import { Avatar, Card, getInitials } from '@takaro/lib-components';
import { FC } from 'react';

export const ManagerView = () => {};

interface ManageIdentityCardProps {
  id: string;
  name: string;
  roleId: string;
  gameServerId?: string;
  avatar?: string;
}

export const ManageIdentityCard: FC<ManageIdentityCardProps> = ({ name, avatar }) => {
  return (
    <Card style={{ width: '100%', padding: '5px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Avatar size="tiny" variant="circle">
            <Avatar.Image src={avatar} />
            <Avatar.FallBack>{getInitials(name)}</Avatar.FallBack>
          </Avatar>
          <p>{name}</p>
        </div>
      </div>
    </Card>
  );
};
