import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { styled, Button, TextField, Drawer, FormError, TextAreaField, Alert, DatePicker } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { VariableOutputDTO } from '@takaro/apiclient';
import { z } from 'zod';
import { GameServerSelectQueryField, ModuleSelectQueryField, PlayerSelectQueryField } from '../selects';
import { DateTime } from 'luxon';

const validationSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(255),
  playerId: z.string().uuid().optional(),
  gameServerId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
  expiresAt: z.string().optional().nullish(),
});
export type IFormInputs = z.infer<typeof validationSchema>;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

interface CreateAndUpdateVariableformProps {
  variable?: VariableOutputDTO;
  isLoading?: boolean;
  onSubmit?: (variable: IFormInputs) => void;
  error?: string | string[] | null;
}

export const VariablesForm: FC<CreateAndUpdateVariableformProps> = ({ variable, isLoading, onSubmit, error }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const readOnly = onSubmit === undefined;

  useEffect(() => {
    if (!open) {
      navigate({ to: '/variables' });
    }
  }, [open, navigate]);

  const { control, handleSubmit, formState } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    ...(variable && {
      values: {
        key: variable.key,
        value: variable.value,
        playerId: variable.playerId,
        gameServerId: variable.gameServerId,
        moduleId: variable.moduleId,
        expiresAt: variable.expiresAt,
      },
    }),
  });

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={readOnly === false && formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>{variable ? (readOnly ? 'View' : 'Update') : 'Create'} variable</Drawer.Heading>
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
          <form onSubmit={onSubmit && handleSubmit(onSubmit)} id={`${variable ? 'update' : 'create'}-variable-form`}>
            <TextField control={control} label="Key" loading={isLoading} name="key" readOnly={readOnly} required />
            <TextAreaField
              control={control}
              label="Value"
              loading={isLoading}
              name="value"
              placeholder="My cool variable"
              description="Value is a string. However the most common use case is to store stringified JSON. You can e.g. use https://jsonformatter.org/json-stringify-online to stringify JSON."
              required
              readOnly={readOnly}
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
              canClear={true}
              readOnly={readOnly}
            />
            <PlayerSelectQueryField canClear={true} control={control} loading={isLoading} name="playerId" />
            <GameServerSelectQueryField
              canClear={true}
              control={control}
              loading={isLoading}
              name="gameServerId"
              description="If a different value needs to be stored for each game server, select the game server here."
              readOnly={readOnly}
            />
            <ModuleSelectQueryField
              canClear={true}
              control={control}
              name="moduleId"
              loading={isLoading}
              description="If a different value needs to be stored for each module, select the module here."
              readOnly={readOnly}
            />{' '}
            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            {readOnly ? (
              <Button fullWidth onClick={() => setOpen(false)} color="primary">
                Close View
              </Button>
            ) : (
              <>
                <Button fullWidth type="submit" form={`${variable ? 'update' : 'create'}-variable-form`}>
                  {variable ? 'Update variable' : 'Save variable'}
                </Button>
                <Button onClick={() => setOpen(false)} color="background">
                  Cancel
                </Button>
              </>
            )}
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
