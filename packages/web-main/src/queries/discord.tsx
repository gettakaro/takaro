import {
  DiscordInviteOutputDTO,
  GuildOutputArrayDTOAPI,
  GuildOutputDTO,
  GuildOutputDTOAPI,
  GuildSearchInputDTO,
  GuildUpdateDTO,
  InviteOutputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasNextPage, mutationWrapper } from './util';
import { useSnackbar } from 'notistack';

export const discordKeys = {
  guilds: ['discordGuilds'] as const,
  invite: ['discordInvite'] as const,
};

export const discordGuildQueryOptions = (opts: GuildSearchInputDTO) =>
  queryOptions<GuildOutputArrayDTOAPI, AxiosError<GuildOutputDTOAPI>>({
    queryKey: [...discordKeys.guilds, opts],
    queryFn: async () => (await getApiClient().discord.discordControllerSearch(opts)).data,
  });

export const discordGuildInfiniteQueryOptions = (opts: GuildSearchInputDTO) =>
  infiniteQueryOptions<GuildOutputArrayDTOAPI, AxiosError<GuildOutputDTOAPI>>({
    queryKey: [...discordKeys.guilds, opts],
    queryFn: async () => (await getApiClient().discord.discordControllerSearch(opts)).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
  });

export const discordInviteQueryOptions = () =>
  queryOptions<InviteOutputDTO, AxiosError<DiscordInviteOutputDTO>>({
    queryKey: discordKeys.invite,
    queryFn: async () => (await getApiClient().discord.discordControllerGetInvite()).data.data,
  });

interface GuildUpdateInput {
  guildId: string;
  input: GuildUpdateDTO;
}

export const useDiscordGuildUpdate = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<GuildOutputDTO, GuildUpdateInput>(
    useMutation<GuildOutputDTO, AxiosError<GuildOutputDTOAPI>, GuildUpdateInput>({
      mutationFn: async ({ guildId, input }) =>
        (await getApiClient().discord.discordControllerUpdateGuild(guildId, input)).data.data,
      onSuccess: (_) => {
        enqueueSnackbar('Discord guild updated!', { variant: 'default', type: 'success' });
        queryClient.invalidateQueries({ queryKey: discordKeys.guilds });
      },
    }),
    {}
  );
};
