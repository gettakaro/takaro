import { FC } from 'react';
import { useConfig } from 'hooks/useConfig';
import { useAuth } from 'hooks/useAuth';
import { Button, styled, useTheme } from '@takaro/lib-components';
import { FaDiscord } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing[0]};
  height: ${({ theme }) => theme.spacing[12]};
  margin: ${({ theme }) => theme.spacing[1]} 0;
  width: 100%;
`;

export const LoginDiscord: FC = () => {
  const config = useConfig();
  const { session } = useAuth();
  const { colors } = useTheme();

  const hasLinkedDiscord = !!session?.discordId;

  return (
    <Container>
      <FaDiscord size={48} color={hasLinkedDiscord ? colors.primary : colors.background} />
      <span>{hasLinkedDiscord ? `ID: ${session.discordId}` : 'Not connected yet'}</span>
      <a href={`${config.apiUrl}/auth/discord?redirect=${window.location.href}`}>
        <Button text={hasLinkedDiscord ? 'Update' : 'Connect'} />
      </a>
    </Container>
  );
};
