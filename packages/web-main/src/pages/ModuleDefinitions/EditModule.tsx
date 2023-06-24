import { FC, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  Drawer,
  CollapseList,
  styled,
  SchemaGenerator,
  TextAreaField,
} from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { moduleValidationSchema } from './moduleValidationSchema';
import { useModule, useModuleUpdate } from 'queries/modules';
import { ModuleOutputDTO } from '@takaro/apiclient';
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

interface Props {
  mod: ModuleOutputDTO;
}

const EditModule: FC = () => {
  const { moduleId } = useParams();

  const { data, isLoading } = useModule(moduleId!);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return <EditModuleForm mod={data} />;
};

const EditModuleForm: FC<Props> = ({ mod }) => {
  const [open, setOpen] = useState(true);

  const [generalData, setGeneralData] = useState<IFormInputs>();
  const [schema, setSchema] = useState<AnySchema>({});
  const SchemaGeneratorFormRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useModuleUpdate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
    defaultValues: {
      name: mod.name,
      description: mod.description,
    },
  });

  // submit of the general form
  const onGeneralSubmit: SubmitHandler<IFormInputs> = async ({
    name,
    description,
  }) => {
    setGeneralData({ name, description });
  };

  const onGeneratorSubmit = async (schema: AnySchema) => {
    setSchema(schema);
  };

  useEffect(() => {
    try {
      if (
        generalData &&
        Object.keys(generalData).length !== 0 &&
        Object.keys(schema).length !== 0
      ) {
        mutateAsync({
          id: mod.id,
          moduleUpdate: {
            name: generalData.name,
            description: generalData.description,
            configSchema: JSON.stringify(schema),
          },
        });
        navigate(PATHS.moduleDefinitions());
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [
    generalData,
    setGeneralData,
    mutateAsync,
    navigate,
    mod.id,
    schema,
    setSchema,
  ]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Edit Module</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="General">
              <form>
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
                  placeholder=""
                />
              </form>
            </CollapseList.Item>
            <CollapseList.Item title="Config">
              <SchemaGenerator
                initialSchema={JSON.parse(mod.configSchema)}
                onSubmit={onGeneratorSubmit}
                ref={SchemaGeneratorFormRef}
              />
            </CollapseList.Item>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button
              text="Cancel"
              onClick={() => setOpen(false)}
              color="background"
            />
            <Button
              fullWidth
              text="Save changes"
              onClick={() => {
                handleSubmit(onGeneralSubmit)();
                SchemaGeneratorFormRef.current?.dispatchEvent(
                  new Event('submit', { cancelable: true, bubbles: true })
                );
              }}
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default EditModule;
