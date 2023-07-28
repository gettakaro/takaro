import { FC, useEffect, useState, useRef } from 'react';
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
import { AnySchema } from 'ajv';

interface IFormInputs {
  name: string;
  description?: string;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CreateModule: FC = () => {
  const [open, setOpen] = useState(true);
  const [generalData, setGeneralData] = useState<IFormInputs>();
  const [errorMessage, setErrorMessage] = useState<string | string[] | undefined>();
  const [schema, setSchema] = useState<null | AnySchema>(null);
  const SchemaGeneratorFormRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { mutateAsync, isLoading, error: createModuleError } = useModuleCreate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
  });

  const onGeneralSubmit: SubmitHandler<IFormInputs> = async ({ name, description }) => {
    setGeneralData({ name, description });
  };

  const onGeneratorSubmit = async (schema: AnySchema) => {
    if (schema) setSchema(schema);
  };

  useEffect(() => {
    const createModule = async () => {
      if (generalData && Object.keys(generalData).length !== 0 && schema && Object.keys(schema).length !== 0) {
        try {
          await mutateAsync({
            name: generalData.name,
            description: generalData.description,
            configSchema: JSON.stringify(schema),
          });

          navigate(PATHS.moduleDefinitions());
        } catch (error) {
          console.log(error);
          Sentry.captureException(error);
        }
      }
    };

    createModule();
  }, [generalData, setGeneralData, mutateAsync, navigate, schema, setSchema]);

  if (!errorMessage && createModuleError) {
    const errorType = errors.defineErrorType(createModuleError);
    if (errorType instanceof errors.UniqueConstraintError) {
      setErrorMessage('A module with that name already exists.');
    }
    if (errorType instanceof errors.ResponseValidationError) {
      const msgs = errorType.parseValidationError();
      setErrorMessage(msgs);
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
              <form id="create-module-form">
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
              <SchemaGenerator onSchemaChange={onGeneratorSubmit} ref={SchemaGeneratorFormRef} />
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
              onClick={() => {
                SchemaGeneratorFormRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                handleSubmit(onGeneralSubmit)();
              }}
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default CreateModule;
