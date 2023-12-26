import { FC, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { errors, Button, TextField, Drawer, FormError, TextAreaField, Alert } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { VariableOutputDTO } from '@takaro/apiclient';
import { useVariableCreate } from 'queries/variables';
import { useSnackbar } from 'notistack';
import { styled } from '@takaro/lib-components';

import { z } from 'zod';
import { useVariable, useVariableUpdate } from 'queries/variables/queries';
import { GameServerSelect, PlayerSelect } from 'components/selects';
import { ModuleSelect } from 'components/selects/ModuleSelect';
import { AxiosError } from 'axios';

enum ExecutionType {
  CREATE = 'create',
  UPDATE = 'update',
}

const validationSchema = z.object({
  key: z.string().nonempty().max(25),
  value: z.string().nonempty().max(255),
  playerId: z.string().uuid().optional(),
  gameServerId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
});

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const VariablesCreate = () => {
  const { mutateAsync, isLoading, error } = useVariableCreate();

  async function createVariable(variable: IFormInputs) {
    await mutateAsync({
      key: variable.key,
      value: variable.value,
      moduleId: variable.moduleId,
      playerId: variable.playerId,
      gameServerId: variable.gameServerId,
    });
  }
  return (
    <VariableCreateAndUpdateForm
      isLoading={isLoading}
      submit={createVariable}
      type={ExecutionType.CREATE}
      error={error}
    />
  );
};

export const VariablesUpdate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { variableId } = useParams();

  if (variableId === undefined) {
    enqueueSnackbar('No variable id provided', { variant: 'default', type: 'error' });
    navigate(-1);
  }

  async function updateVariable(variable: IFormInputs) {
    await mutateAsync({ variableId: variableId!, variableDetails: variable });
  }
  const { data, isLoading } = useVariable(variableId!);
  const { mutateAsync } = useVariableUpdate();

  // set null values to undefined otherwise zod will complain
  if (data?.playerId === null) {
    data.playerId = undefined;
  }
  if (data?.gameServerId === null) {
    data.gameServerId = undefined;
  }
  if (data?.moduleId === null) {
    data.moduleId = undefined;
  }

  return (
    <VariableCreateAndUpdateForm
      isLoading={isLoading}
      variable={data}
      submit={updateVariable}
      type={ExecutionType.UPDATE}
    />
  );
};

interface CreateAndUpdateVariableformProps {
  variable?: VariableOutputDTO;
  isLoading: boolean;
  type: ExecutionType;
  submit: (variable: IFormInputs) => Promise<void>;
  error?: AxiosError<any> | null;
}

interface IFormInputs {
  key: string;
  value: string;
  gameServerId?: string;
  playerId?: string;
  moduleId?: string;
}

const VariableCreateAndUpdateForm: FC<CreateAndUpdateVariableformProps> = ({
  variable,
  isLoading,
  submit,
  type,
  error: responseError,
}) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      navigate(-1);
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
    },
  });

  const error = useMemo(() => {
    if (responseError) {
      const err = errors.defineErrorType(responseError);

      if (err instanceof errors.UniqueConstraintError) {
        return 'Variable with this key already exists';
      }
      return;
    }
  }, [responseError]);

  const onSubmit: SubmitHandler<IFormInputs> = async (variable) => {
    await submit(variable);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>{type === ExecutionType.CREATE ? 'Create' : 'Edit'} variable</Drawer.Heading>
        <Drawer.Body>
          <Alert
            variant="warning"
            text="Most often you'll want to create and update variables using the variables API in your module code."
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
            <PlayerSelect control={control} loading={isLoading} name="playerId" />
            <GameServerSelect
              control={control}
              loading={isLoading}
              name="gameServerId"
              description="If a different value needs to be stored for each game server, select the game server here."
            />
            <ModuleSelect
              control={control}
              name="moduleId"
              loading={isLoading}
              description="If a different value needs to be stored for each module, select the module here."
            />

            {error && <FormError message={error} />}
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
