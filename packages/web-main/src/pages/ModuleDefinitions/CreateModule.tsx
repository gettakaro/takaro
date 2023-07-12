import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  Drawer,
  CollapseList,
  styled,
  SchemaGenerator,
  errors,
  FormError,
  TextAreaField,
} from '@takaro/lib-components';
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
  const [errorMessage, setErrorMessage] = useState<string | string[] | undefined>();
  const [schema, setSchema] = useState({});
  const navigate = useNavigate();
  const { mutateAsync, isLoading, error: createModuleError } = useModuleCreate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { control, handleSubmit, formState } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, description }) => {
    try {
      setErrorMessage(undefined);
      await mutateAsync({
        name,
        description,
        configSchema: JSON.stringify(schema),
      });

      navigate(PATHS.moduleDefinitions());
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
  };

  if (!errorMessage && createModuleError) {
    const errorType = errors.defineErrorType(createModuleError);
    if (errorType instanceof errors.UniqueConstraintError) {
      setErrorMessage('A module with that name already exists.');
    }
    if (errorType instanceof errors.ResponseValidationError) {
      // TODO: setup error messages for response validation errors
    }
    if (errorType instanceof errors.InternalServerError) {
      setErrorMessage(errorType.message);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Create Module</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="General">
              <form onSubmit={handleSubmit(onSubmit)} id="create-module-form">
                <TextField
                  control={control}
                  label="Name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool module"
                  required
                />
                <TextAreaField
                  control={control}
                  label="Description"
                  loading={isLoading}
                  name="description"
                  placeholder="This module does cool stuff"
                />
              </form>
            </CollapseList.Item>
            <CollapseList.Item title="Config">
              <SchemaGenerator onSchemaChange={setSchema} />
            </CollapseList.Item>
          </CollapseList>
          {errorMessage && <FormError message={errorMessage} />}
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button
              fullWidth
              text="Save changes"
              type="submit"
              form="create-module-form"
              disabled={!!errorMessage && !formState.isDirty}
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default CreateModule;
