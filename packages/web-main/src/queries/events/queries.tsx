import {
  Client,
  CommandOutputDTO,
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
import _ from 'lodash';

const cleanEvent = (event: EventOutputDTO) => {
  const newEvent = { ...event };

  Object.keys(newEvent).forEach((key) => {
    if (newEvent[key] === null) {
      delete newEvent[key];
    }
  });

  delete newEvent.playerId;
  delete newEvent.gameserverId;
  delete newEvent.moduleId;

  return newEvent;
};

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
};

export const useEnrichEvent = (event: EventOutputDTO | null) => {
  const apiClient = useApiClient();

  const events = event ? [event] : [];

  return useQuery<EnrichedEvent, AxiosError<EnrichedEvent>>({
    queryKey: ['lastEvent', event?.id ?? ''],
    queryFn: async () => {
      const enriched = await enrichEvents(apiClient, events);
      return enriched[0];
    },
    enabled: !!event,
  });
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

    const meta = event.meta as Record<string, any> | undefined;
    const command = mod?.commands.find((c) => c.id === meta?.command?.command);

    const enriched = {
      ...cleanEvent(event),
      player,
      gameserver,
      module: mod,
      command,
    };

    return _.omit(enriched, 'gameserver.connectionInfo');
  });
};

const fetchEvents = async (apiClient: Client, queryParams: EventSearchInputDTO) => {
  const events = await apiClient.event.eventControllerSearch(queryParams);
  const enRiched = await enrichEvents(apiClient, events.data.data);

  return enRiched;
};

export interface EnrichedEvent extends Pick<EventOutputDTO, 'id' | 'createdAt' | 'eventName' | 'meta'> {
  player: PlayerOutputDTO | undefined;
  gameserver: GameServerOutputDTO | undefined;
  module: ModuleOutputDTO | undefined;
  command: CommandOutputDTO | undefined;
}

export const useEvents = (queryParams: EventSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  return useQuery<EnrichedEvent[], AxiosError<EnrichedEvent[]>>({
    queryKey: [eventKeys.list(), { ...queryParams }],
    queryFn: async () => await fetchEvents(apiClient, queryParams),
  });
};
