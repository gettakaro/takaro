import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { EventNameSelect } from 'components/selects/EventNameSelect';
import { GameServerSelect, PlayerSelect } from 'components/selects';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateRangePicker, Button, styled } from '@takaro/lib-components';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto 0.5fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
`;

interface EventFilterProps {
  defaultValues: {
    playerIds?: string[];
    gameServerIds?: string[];
    eventNames?: EventName[];
    dateRange?: { start?: string; end?: string };
  };
  onSubmit: (data: EventFilterInputs) => void;
  isLive?: boolean;
}

export const eventFilterSchema = z.object({
  dateRange: z
    .object({
      start: z.string().optional().catch(undefined),
      end: z.string().optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
  playerIds: z.array(z.string()).optional().default([]),
  gameServerIds: z.array(z.string()).optional().default([]),
  eventNames: z.array(z.nativeEnum(EventName)).optional().default([]),
});
export type EventFilterInputs = z.infer<typeof eventFilterSchema>;

export const EventFilter: FC<EventFilterProps> = ({ defaultValues, onSubmit, isLive }) => {
  const { control, handleSubmit, formState } = useForm<EventFilterInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(eventFilterSchema),
    defaultValues: {
      dateRange: defaultValues?.dateRange,
      playerIds: defaultValues?.playerIds,
      gameServerIds: defaultValues.gameServerIds,
      eventNames: defaultValues.eventNames,
    },
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <PlayerSelect multiple={true} name="playerIds" canClear={true} control={control} label="Players" />
      <GameServerSelect
        multiple={true}
        name="gameServerIds"
        canClear={true}
        control={control}
        hasMargin
        label="Gameservers"
      />
      <EventNameSelect multiple={true} name="eventNames" canClear={true} control={control} label="Event names" />
      <DateRangePicker
        control={control}
        name="dateRange"
        id="event-daterange-picker"
        disabled={isLive}
        label="Select date range"
      />
      <Button disabled={!formState.isDirty} text="Apply filters" type="submit" fullWidth />
    </Form>
  );
};
