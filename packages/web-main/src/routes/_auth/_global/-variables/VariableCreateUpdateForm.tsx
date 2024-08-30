import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { styled, Button, TextField, Drawer, FormError, TextAreaField, Alert, DatePicker } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { VariableOutputDTO } from '@takaro/apiclient';
import { z } from 'zod';
import { GameServerSelect, PlayerSelect } from 'components/selects';
import { ModuleSelect } from 'components/selects/ModuleSelect';
import { DateTime } from 'luxon';

export enum ExecutionType {
  CREATE = 'create',
  UPDATE = 'update',
}

const validationSchema = z.object({
  key: z.string().min(1).max(25),
  value: z.string().min(1).max(255),
  playerId: z.string().uuid().optional(),
  gameServerId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
  expiresAt: z.string().optional(),
});
export type IFormInputs = z.infer<typeof validationSchema>;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

interface CreateAndUpdateVariableformProps {
  variable?: VariableOutputDTO;
  isLoading: boolean;
  type: ExecutionType;
  submit: (variable: IFormInputs) => void;
  error?: string | string[] | null;
}

export const VariablesForm: FC<CreateAndUpdateVariableformProps> = ({ variable, isLoading, submit, type, error }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      navigate({ to: '/variables' });
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      key: variable?.key,
      value: variable?.value,
      playerId: variable?.playerId,
      gameServerId: variable?.gameServerId,
      moduleId: variable?.moduleId,
      expiresAt: variable?.expiresAt,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (variable) => {
    submit(variable);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>{type === ExecutionType.CREATE ? 'Create' : 'Edit'} variable</Drawer.Heading>
        <Drawer.Body>
          <Alert
            variant="warning"
            text="In most cases, you will prefer to utilize the variables API for creating and updating variables within your module code."
          />
          <details>
            <summary>What are variables?</summary>
            if you want to keep track of data across multiple executions? For example, you want to keep track of how
            many times a player has joined the server. Variable keys must be unique per combination of GameServer,
            Player, and Module. This means you can have a variable with the key playerJoinedCount for each unique
            combination of a player, a game server, and a module, but you cannot have two variables with the same key
            for the same combination.
          </details>
          <form
            onSubmit={handleSubmit(onSubmit)}
            id={`${type === ExecutionType.CREATE ? 'create' : 'update'}-variable-form`}
          >
            <TextField control={control} label="Key" loading={isLoading} name="key" required />
            <TextAreaField
              control={control}
              label="Value"
              loading={isLoading}
              name="value"
              placeholder="My cool role"
              description="Value is a string. However the most common use case is to store stringified JSON. You can e.g. use https://jsonformatter.org/json-stringify-online to stringify JSON."
              required
            />
            <DatePicker
              control={control}
              label="Expiration date"
              loading={isLoading}
              name="expiresAt"
              description="If you want the variable to expire at a specific date, select the date here"
              mode="absolute"
              required={false}
              allowPastDates={false}
              format={DateTime.DATETIME_SHORT}
            />
            <PlayerSelect canClear={true} control={control} loading={isLoading} name="playerId" />
            <GameServerSelect
              canClear={true}
              control={control}
              loading={isLoading}
              name="gameServerId"
              description="If a different value needs to be stored for each game server, select the game server here."
            />
            <ModuleSelect
              canClear={true}
              control={control}
              name="moduleId"
              loading={isLoading}
              description="If a different value needs to be stored for each module, select the module here."
            />

            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button
              fullWidth
              text={type === ExecutionType.CREATE ? 'Save variable' : 'Update variable'}
              type="submit"
              form={`${type === ExecutionType.CREATE ? 'create' : 'update'}-variable-form`}
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
