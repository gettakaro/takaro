import {
  Client,
  EventOutputArrayDTOAPI,
  EventOutputDTO,
  EventSearchInputDTO,
  GameServerOutputDTO,
  ModuleOutputDTO,
  PlayerOutputDTO,
} from '@takaro/apiclient';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useApiClient } from 'hooks/useApiClient';

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

const enrichEvents = async (apiClient: Client, events: EventOutputArrayDTOAPI['data']): Promise<EnrichedEvent[]> => {
  const idFilter = (id: string | undefined): id is string => id !== undefined && id !== '' && id !== null;

  const playerIds = events.map((event) => event.playerId).filter(idFilter);
  const gameserverIds = events.map((event) => event.gameserverId).filter(idFilter);
  const moduleIds = events.map((event) => event.moduleId).filter(idFilter);

  const [players, gameservers, modules] = await Promise.all([
    apiClient.player.playerControllerSearch({
      filters: { id: playerIds },
    }),
    apiClient.gameserver.gameServerControllerSearch({
      filters: { id: gameserverIds },
    }),
    apiClient.module.moduleControllerSearch({
      filters: { id: moduleIds },
    }),
  ]);

  return events.map((event) => {
    const player = players.data.data.find((player) => player.id === event.playerId);
    const gameserver = gameservers.data.data.find((gameserver) => gameserver.id === event.gameserverId);
    const mod = modules.data.data.find((m) => m.id === event.moduleId);

    return {
      ...event,
      player,
      gameserver,
      module: mod,
    };
  });
};

const fetchEvents = async (apiClient: Client, queryParams: EventSearchInputDTO) => {
  const events = await apiClient.event.eventControllerSearch(queryParams);
  const enRiched = await enrichEvents(apiClient, events.data.data);

  return enRiched;
};

interface EnrichedEvent extends EventOutputDTO {
  player: PlayerOutputDTO | undefined;
  gameserver: GameServerOutputDTO | undefined;
  module: ModuleOutputDTO | undefined;
}

export const useEvents = (queryParams: EventSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  return useQuery<EnrichedEvent[], AxiosError<EnrichedEvent[]>>({
    queryKey: ['events', { queryParams }],
    queryFn: async () => await fetchEvents(apiClient, queryParams),
  });
};
