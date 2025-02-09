import { FC } from 'react';
import { Card, Button, styled, useTheme } from '@takaro/lib-components';
import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { getConfigVar } from '../../../../../util/getConfigVar';
import { useSession } from '../../../../../hooks/useSession';

const InnerBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
`;

export const LoginDiscordCard: FC = () => {
  const { session } = useSession();
  const { colors } = useTheme();

  const hasLinkedDiscord = !!session.user.discordId;
  return (
    <Card>
      <Card.Body>
        <InnerBody>
          <DiscordIcon size={48} color={hasLinkedDiscord ? colors.primary : colors.backgroundAccent} />
          <a href={`${getConfigVar('apiUrl')}/auth/discord?redirect=${window.location.href}`}>
            <Button text={hasLinkedDiscord ? 'Update connection' : 'Connect Discord'} />
          </a>
        </InnerBody>
      </Card.Body>
    </Card>
  );
};
