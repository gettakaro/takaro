import React, { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm, useFieldArray } from 'react-hook-form';
import {
  Button,
  TextField,
  DrawerContent,
  DrawerHeading,
  Drawer,
  DrawerFooter,
  DrawerBody,
  CollapseList,
  ErrorMessage,
  styled,
  Divider,
} from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { moduleValidationSchema } from './moduleValidationSchema';
import { useModuleCreate } from 'queries/modules';
import { generateJSONSchema, Input, InputType } from 'lib/jsonSchemaGenerator';
import { FormField } from 'lib/getFormField';

interface IFormInputs {
  name: string;
  description?: string;
  configFields: Input[];
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CreateModule: FC = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
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

  const { fields, append } = useFieldArray({
    control,
    name: 'configFields',
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({
    name,
    description,
  }) => {
    try {
      setError('');

      const configSchema = await generateJSONSchema(fields);

      mutateAsync({
        name,
        description,
        configSchema: JSON.stringify(configSchema),
      });

      navigate(PATHS.moduleDefinitions());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeading>Create Module</DrawerHeading>
        <DrawerBody>
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
                {fields.map((field) => {
                  return (
                    <>
                      <FormField input={field} control={control} />
                      <Divider />
                    </>
                  );
                })}

                <Button
                  text="Add Config Field"
                  type="button"
                  onClick={() => {
                    append({
                      name: 'test',
                      type: InputType.string,
                      description: 'test',
                      required: true,
                      default: 'test',
                    });
                  }}
                />
              </CollapseList.Item>
              {error && <ErrorMessage message={error} />}
            </form>
          </CollapseList>
        </DrawerBody>
        <DrawerFooter>
          <ButtonContainer>
            <Button
              text="Cancel"
              onClick={() => setOpen(false)}
              color="background"
            />
            <Button
              fullWidth
              text="Save changes"
              type="submit"
              form="create-module-form"
            />
          </ButtonContainer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateModule;
