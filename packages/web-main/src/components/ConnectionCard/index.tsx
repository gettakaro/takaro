import { FC, ReactElement } from 'react';
import { Container } from './style';
import { useConfig } from 'hooks/useConfig';
import { useAuth } from 'hooks/useAuth';

interface ConnectionCardProps {
  name: string;
  icon: ReactElement;
}

export const ConnectionCard: FC<ConnectionCardProps> = ({ name, icon }) => {
  const config = useConfig();
  const { session } = useAuth();

  return (
    <Container
      href={`${config.apiUrl}/auth/${name.toLowerCase()}?redirect=${
        window.location.href
      }`}
    >
      {icon}
      <h1>{name}</h1>
      <span>
        {session?.discordId ? session.discordId : 'Not connected yet'}
      </span>
    </Container>
  );
};
