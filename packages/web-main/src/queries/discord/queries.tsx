import { GuildSearchInputDTO, GuildUpdateDTO, InviteOutputDTO } from '@takaro/apiclient';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';
import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { hasNextPage } from '../util';

export const discordKeys = {
  guilds: ['discordGuilds'] as const,
  invite: ['discordInvite'] as const,
};

export const useDiscordGuilds = ({ page = 0, ...guildSearchInputArgs }: GuildSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const query = useInfiniteQuery({
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

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...query} />;
  }, [query]);

  return { ...query, InfiniteScroll };
};

export const useDiscordInvite = () => {
  const apiClient = useApiClient();

  return useQuery<InviteOutputDTO>({
    queryKey: discordKeys.invite,
    queryFn: async () => (await apiClient.discord.discordControllerGetInvite()).data.data,
  });
};

export const useDiscordGuildUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: GuildUpdateDTO }) =>
      (await apiClient.discord.discordControllerUpdateGuild(id, input)).data.data,
    onSuccess: () => {
      // TODO: caching, after the returned type is fixed
      queryClient.invalidateQueries(discordKeys.guilds);
    },
  });
};
