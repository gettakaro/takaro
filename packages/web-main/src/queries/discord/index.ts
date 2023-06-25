import {
  GameServerOutputDTO,
  GuildOutputDTO,
  GuildSearchInputDTO,
  GuildUpdateDTO,
  InviteOutputDTO,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { gameServerKeys } from 'queries/gameservers';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const discordKeys = {
  guilds: ['discordGuilds'] as const,
  invite: ['discordInvite'] as const,
};

export const useDiscordGuilds = (input?: GuildSearchInputDTO) => {
  const apiClient = useApiClient();

  return useQuery<GuildOutputDTO[]>({
    queryKey: discordKeys.guilds,
    queryFn: async () =>
      (await apiClient.discord.discordControllerSearch(input)).data.data,
  });
};

export const useDiscordInvite = () => {
  const apiClient = useApiClient();

  return useQuery<InviteOutputDTO>({
    queryKey: discordKeys.invite,
    queryFn: async () =>
      (await apiClient.discord.discordControllerGetInvite()).data.data,
  });
};

export const useDiscordGuildUpdate = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: GuildUpdateDTO }) =>
      (await apiClient.discord.discordControllerUpdateGuild(id, input)).data
        .data,
    onSuccess: (data) => {
      // TODO: update cache :)
    },
  });
};
