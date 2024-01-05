import { FC } from 'react';
import { useConfig } from 'hooks/useConfig';
import { useAuth } from 'hooks/useAuth';
import { Card, Button, styled, useTheme } from '@takaro/lib-components';
import { FaDiscord as DiscordIcon } from 'react-icons/fa';

const Body = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
`;

export const LoginDiscordCard: FC = () => {
  const config = useConfig();
  const { session } = useAuth();
  const { colors } = useTheme();

  const hasLinkedDiscord = !!session?.discordId;

  return (
    <Card>
      <Body>
        <DiscordIcon size={48} color={hasLinkedDiscord ? colors.primary : colors.background} />
        <span>{hasLinkedDiscord ? '' : 'Not connected yet'}</span>
        <a href={`${config.apiUrl}/auth/discord?redirect=${window.location.href}`}>
          <Button text={hasLinkedDiscord ? 'Update connection' : 'Connect'} />
        </a>
      </Body>
    </Card>
  );
};
