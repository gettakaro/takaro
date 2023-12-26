import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField, Drawer, FormError, TextAreaField } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from 'paths';
import { VariableOutputDTO } from '@takaro/apiclient';
import { useVariableCreate } from 'queries/variables';
import { useSnackbar } from 'notistack';
import { styled } from '@takaro/lib-components';

import { z } from 'zod';
import { useVariable, useVariableUpdate } from 'queries/variables/queries';

const validationSchema = z.object({
  key: z.string().nonempty().max(25),
  value: z.string().nonempty().max(255),
  playerId: z.string().uuid(),
  gameServerId: z.string().uuid(),
  moduleId: z.string().uuid(),
});

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const VariablesCreate = () => {
  const { mutateAsync, isLoading } = useVariableCreate();

  async function createVariable(variable: IFormInputs) {
    await mutateAsync({
      key: variable.key,
      value: variable.value,
      moduleId: variable.moduleId,
      playerId: variable.playerId,
      gameServerId: variable.gameServerId,
    });
  }
  return <VariableCreateAndUpdateForm isLoading={isLoading} submit={createVariable} />;
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
  return <VariableCreateAndUpdateForm isLoading={isLoading} variable={data} submit={updateVariable} />;
};

interface CreateAndUpdateVariableformProps {
  variable?: VariableOutputDTO;
  isLoading: boolean;
  submit: (variable: IFormInputs) => Promise<void>;
}

interface IFormInputs {
  key: string;
  value: string;
  gameServerId?: string;
  playerId?: string;
  moduleId?: string;
}

const VariableCreateAndUpdateForm: FC<CreateAndUpdateVariableformProps> = ({ variable, isLoading, submit }) => {
  const [open, setOpen] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.roles.overview());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...variable,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (variable) => {
    await submit(variable);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Create role</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={handleSubmit(onSubmit)} id="create-variable-form">
            <TextField
              control={control}
              label="Key"
              loading={isLoading}
              name="key"
              placeholder="My cool role"
              required
            />
            <TextAreaField
              control={control}
              label="Value"
              loading={isLoading}
              name="value"
              placeholder="My cool role"
              required
            />
            {error && <FormError message={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button fullWidth text="Save changes" type="submit" form="create-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
