import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField, Drawer, CollapseList, styled, SchemaGenerator } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { moduleValidationSchema } from './moduleValidationSchema';
import { useModuleCreate } from 'queries/modules';

interface IFormInputs {
  name: string;
  description?: string;
  configFields: string;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CreateModule: FC = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
  const [schema, setSchema] = useState({});
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useModuleCreate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, description }) => {
    try {
      setError('');

      mutateAsync({
        name,
        description,
        configSchema: JSON.stringify(schema),
      });

      navigate(PATHS.moduleDefinitions());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Create Module</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="create-module-form">
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool module"
                  required
                />
                <TextField
                  control={control}
                  label="Description"
                  loading={isLoading}
                  name="description"
                  placeholder="This module does cool stuff"
                />
              </CollapseList.Item>
              <CollapseList.Item title="Config">
                <SchemaGenerator onSchemaChange={setSchema} />
              </CollapseList.Item>
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button fullWidth text="Save changes" type="submit" form="create-module-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default CreateModule;
