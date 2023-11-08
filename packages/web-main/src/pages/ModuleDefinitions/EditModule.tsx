import { FC, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm, useFieldArray } from 'react-hook-form';
import {
  Button,
  TextField,
  Drawer,
  CollapseList,
  styled,
  SchemaGenerator,
  TextAreaField,
  Tooltip,
  IconButton,
  FormError,
  PERMISSIONS,
} from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { moduleValidationSchema } from './moduleValidationSchema';
import { useModule, useModuleUpdate } from 'queries/modules';
import { ModuleOutputDTO, PermissionCreateDTO } from '@takaro/apiclient';
import { AnySchema } from 'ajv';
import { Column, Fields, PermissionCard, PermissionList } from './style';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { useUserHasPermissions } from 'components/PermissionsGuard';

interface IFormInputs {
  name: string;
  description?: string;
  permissions: PermissionCreateDTO[];
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
  const { mutate, isLoading, error, isSuccess } = useModuleUpdate();
  const hasPermissions = useUserHasPermissions();

  useEffect(() => {
    if (!open || hasPermissions([PERMISSIONS.MANAGE_MODULES])) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
    defaultValues: {
      name: mod.name,
      description: mod.description,
      permissions: mod.permissions,
    },
  });

  const {
    fields,
    append: addField,
    remove,
  } = useFieldArray({
    control: control,
    name: 'permissions',
  });

  // submit of the general form
  const onGeneralSubmit: SubmitHandler<IFormInputs> = async ({ name, description, permissions }) => {
    setGeneralData({ name, description, permissions });
  };

  const onGeneratorSubmit = async (schema: AnySchema) => {
    setSchema(schema);
  };

  useEffect(() => {
    if (isSuccess) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [isSuccess]);

  useEffect(() => {
    try {
      if (generalData && Object.keys(generalData).length !== 0 && Object.keys(schema).length !== 0) {
        mutate({
          id: mod.id,
          moduleUpdate: {
            name: generalData.name,
            description: generalData.description,
            configSchema: JSON.stringify(schema),
            permissions: generalData.permissions,
          },
        });
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [generalData, setGeneralData, mod.id, schema, setSchema]);

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

            <CollapseList.Item title="Permissions">
              <details>
                <summary>What are permissions?</summary>
                <p>
                  Permissions are a way to control who can use the items inside your module or control the behavior of
                  functions inside your module. For example, if you have a command that only admins should be able to
                  use, you can create a permission for it and then check for it to the command. Or, you might want to
                  have different behavior for different groups of players (e.g. regular players vs donators)
                </p>
              </details>

              {fields.length > 0 && (
                <PermissionList>
                  {fields.map((field, index) => (
                    <PermissionCard key={field.id} data-testid={`permission-${index}`}>
                      <Fields>
                        <TextField
                          label="Name"
                          control={control}
                          name={`permissions.${index}.permission`}
                          description="This is the permission code name, what you will need to check for inside the module code"
                        />

                        <TextField control={control} label="Description" name={`permissions.${index}.description`} />
                        <TextField control={control} label="Friendly name" name={`permissions.${index}.friendlyName`} />
                      </Fields>
                      <Column>
                        <Tooltip>
                          <Tooltip.Trigger asChild>
                            <IconButton
                              onClick={() => remove(index)}
                              icon={<CloseIcon size={16} cursor="pointer" />}
                              ariaLabel="Remove"
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>Remove</Tooltip.Content>
                        </Tooltip>
                      </Column>
                    </PermissionCard>
                  ))}
                </PermissionList>
              )}
              <Button
                onClick={(_e) => {
                  addField({
                    permission: '',
                    description: 'No description',
                    friendlyName: '',
                  });
                }}
                type="button"
                fullWidth
                text="New permission"
                variant="outline"
              ></Button>
            </CollapseList.Item>

            <CollapseList.Item title="Config">
              <SchemaGenerator
                initialSchema={JSON.parse(mod.configSchema)}
                onSubmit={onGeneratorSubmit}
                ref={SchemaGeneratorFormRef}
              />
            </CollapseList.Item>
          </CollapseList>

          {error && <FormError error={error} />}
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button
              fullWidth
              text="Save changes"
              onClick={() => {
                handleSubmit(onGeneralSubmit)();
                SchemaGeneratorFormRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }}
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default EditModule;
