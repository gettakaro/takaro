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
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import { getApiClient } from 'util/getApiClient';
import { useMemo } from 'react';
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasNextPage, mutationWrapper } from '../util';

export const discordKeys = {
  guilds: ['discordGuilds'] as const,
  invite: ['discordInvite'] as const,
};

export const useDiscordGuilds = ({
  page = 0,
  sortDirection,
  sortBy,
  limit,
  search,
  filters,
  extend,
}: GuildSearchInputDTO = {}) => {
  const apiClient = getApiClient();

  const query = useInfiniteQuery<GuildOutputArrayDTOAPI, AxiosError<GuildOutputDTOAPI>>({
    queryKey: [...discordKeys.guilds, page, sortBy, sortDirection, filters, search],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.discord.discordControllerSearch({
          limit,
          sortBy,
          sortDirection,
          filters,
          search,
          extend,
          page: pageParam as number,
        })
      ).data,
    initialPageParam: page,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...query} />;
  }, [query]);

  return { ...query, InfiniteScroll };
};

export const useDiscordInvite = () => {
  const apiClient = getApiClient();

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
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<GuildOutputDTO, GuildUpdateInput>(
    useMutation<GuildOutputDTO, AxiosError<GuildOutputDTOAPI>, GuildUpdateInput>({
      mutationFn: async ({ id, input }) => (await apiClient.discord.discordControllerUpdateGuild(id, input)).data.data,
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
