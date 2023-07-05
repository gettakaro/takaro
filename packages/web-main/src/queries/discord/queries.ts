import {
  DiscordInviteOutputDTO,
  GuildOutputDTO,
  GuildOutputDTOAPI,
  GuildSearchInputDTO,
  GuildUpdateDTO,
  InviteOutputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { useApiClient } from 'hooks/useApiClient';
import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { hasNextPage } from '../util';

export const discordKeys = {
  guilds: ['discordGuilds'] as const,
  invite: ['discordInvite'] as const,
};

export const useDiscordGuilds = ({ page = 0, ...guildSearchInputArgs }: GuildSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  return useInfiniteQuery<GuildOutputDTOAPI, AxiosError<GuildOutputDTOAPI>>({
    queryKey: discordKeys.guilds,
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.discord.discordControllerSearch({
          ...guildSearchInputArgs,
          page: pageParam,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });
};

export const useDiscordInvite = () => {
  const apiClient = useApiClient();

  return useQuery<InviteOutputDTO, AxiosError<DiscordInviteOutputDTO>>({
    queryKey: discordKeys.invite,
    queryFn: async () => (await apiClient.discord.discordControllerGetInvite()).data.data,
  });
};

interface GuildUpdateInput {
  id: string;
  input: GuildUpdateDTO;
}

export const useDiscordGuildUpdate = () => {
  const apiClient = useApiClient();

  return useMutation<GuildOutputDTO[], AxiosError<GuildOutputDTOAPI>, GuildUpdateInput>({
    mutationFn: async ({ id, input }) => (await apiClient.discord.discordControllerUpdateGuild(id, input)).data.data,
    onSuccess: (data) => {
      // TODO: Add new guild data to list of guilds
    },
  });
};
