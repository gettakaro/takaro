import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { GameServerSelectQueryField, PlayerSelectQueryField, EventNameSelectField } from '../../components/selects';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateRangePicker, Button, styled } from '@takaro/lib-components';
import { ModuleSelectQueryField } from '../../components/selects/ModuleSelectQueryField';
import { eventFilterSchema } from './eventFilterSchema';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto 0.5fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
`;

interface EventFilterProps {
  initialSelectedValues: {
    playerIds?: string[];
    gameServerIds?: string[];
    eventNames?: EventName[];
    dateRange?: { start?: string; end?: string };
    moduleIds?: string[];
  };
  onSubmit: (data: EventFilterInputs) => void;
  isLoading: boolean;
  isLive?: boolean;
}

export type EventFilterInputs = z.infer<typeof eventFilterSchema>;

export const EventFilter: FC<EventFilterProps> = ({ initialSelectedValues, onSubmit, isLoading, isLive }) => {
  const { control, handleSubmit, formState } = useForm<EventFilterInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(eventFilterSchema),
    values: {
      dateRange: initialSelectedValues?.dateRange ?? { start: undefined, end: undefined },
      playerIds: initialSelectedValues?.playerIds ?? [],
      gameServerIds: initialSelectedValues.gameServerIds ?? [],
      eventNames: initialSelectedValues.eventNames ?? [],
      moduleIds: initialSelectedValues.moduleIds ?? [],
    },
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <PlayerSelectQueryField
        multiple={true}
        loading={isLoading}
        name="playerIds"
        canClear={true}
        control={control}
        label="Players"
      />
      <GameServerSelectQueryField
        multiple={true}
        name="gameServerIds"
        canClear={true}
        control={control}
        label="Gameservers"
        loading={isLoading}
      />
      <ModuleSelectQueryField multiple={true} name="moduleIds" canClear={true} control={control} loading={isLoading} />
      <EventNameSelectField multiple={true} name="eventNames" canClear={true} control={control} label="Event names" />
      <DateRangePicker
        control={control}
        name="dateRange"
        id="event-daterange-picker"
        disabled={isLive}
        loading={isLoading}
        label="Interval"
      />
      <Button disabled={!formState.isDirty} type="submit" fullWidth>
        Apply filters
      </Button>
    </Form>
  );
};
