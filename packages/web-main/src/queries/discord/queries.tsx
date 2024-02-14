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
import { InfiniteData, infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasNextPage, mutationWrapper } from '../util';

export const discordKeys = {
  guilds: ['discordGuilds'] as const,
  invite: ['discordInvite'] as const,
};

export const discordGuildQueryOptions = (opts: GuildSearchInputDTO) =>
  queryOptions<GuildOutputArrayDTOAPI, AxiosError<GuildOutputDTOAPI>>({
    queryKey: [...discordKeys.guilds, Object.values(opts)],
    queryFn: async () => (await getApiClient().discord.discordControllerSearch(opts)).data,
  });

export const discordGuildInfiniteQueryOptions = (opts: GuildSearchInputDTO) =>
  infiniteQueryOptions<GuildOutputArrayDTOAPI, AxiosError<GuildOutputDTOAPI>>({
    queryKey: [...discordKeys.guilds, ...Object.values(opts)],
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
  id: string;
  input: GuildUpdateDTO;
}

export const useDiscordGuildUpdate = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<GuildOutputDTO, GuildUpdateInput>(
    useMutation<GuildOutputDTO, AxiosError<GuildOutputDTOAPI>, GuildUpdateInput>({
      mutationFn: async ({ id, input }) =>
        (await getApiClient().discord.discordControllerUpdateGuild(id, input)).data.data,
      onSuccess: (updatedGuild) => {
        try {
          // update guild in list of guilds
          queryClient.setQueryData<InfiniteData<GuildOutputArrayDTOAPI>>(discordKeys.guilds, (prev) => {
            if (!prev) {
              return {
                pages: [
                  {
                    data: [updatedGuild],
                    meta: {
                      page: 0,
                      total: 1,
                      limit: 100,
                      error: { code: '', message: '', details: '' },
                      serverTime: '',
                    },
                  },
                ],
                pageParams: [0],
              };
            }

            return {
              ...prev,
              pages: prev.pages.map((page) => ({
                ...page,
                data: page.data.map((guild) => {
                  if (guild.id === updatedGuild.id) {
                    return updatedGuild;
                  }
                  return guild;
                }),
              })),
            };
          });
        } catch (error) {
          queryClient.invalidateQueries({ queryKey: discordKeys.guilds });
        }
      },
    }),
    {}
  );
};
