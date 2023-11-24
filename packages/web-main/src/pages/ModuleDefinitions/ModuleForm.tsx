import { FC, useEffect, useRef, useState } from 'react';
import { Control, UseFieldArrayRemove, useForm, useWatch, useFieldArray, SubmitHandler } from 'react-hook-form';
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
  Chip,
  Alert,
} from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { moduleValidationSchema } from './moduleValidationSchema';
import { ModuleOutputDTO, ModuleOutputDTOAPI, PermissionCreateDTO } from '@takaro/apiclient';
import { AnySchema } from 'ajv';
import { Title, Fields, PermissionCard, PermissionList } from './style';
import { AiOutlineDelete as RemoveIcon, AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { AxiosError } from 'axios';

interface IFormInputs {
  name: string;
  description?: string;
  permissions: PermissionCreateDTO[];
}

export interface ModuleFormSubmitFields extends IFormInputs {
  schema: string;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

interface ModuleFormProps {
  mod?: ModuleOutputDTO;
  onSubmit: (fields: ModuleFormSubmitFields) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: AxiosError<ModuleOutputDTOAPI, any> | null;
}

export const ModuleForm: FC<ModuleFormProps> = ({ mod, isSuccess, onSubmit, isLoading, error }) => {
  const [open, setOpen] = useState(true);

  const [generalData, setGeneralData] = useState<IFormInputs>();
  const [schema, setSchema] = useState<AnySchema>({});
  const [canSubmit, setCanSubmit] = useState(false);
  const SchemaGeneratorFormRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
    defaultValues: {
      name: mod?.name ?? undefined,
      description: mod?.description ?? undefined,
      permissions: mod?.permissions ?? undefined,
    },
  });

  const {
    fields,
    append: addField,
    remove: removeField,
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
    console.log('canSubmit', canSubmit);
    try {
      if (canSubmit && generalData && Object.keys(generalData).length !== 0 && Object.keys(schema).length !== 0) {
        setCanSubmit(false);
        onSubmit({
          name: generalData.name,
          description: generalData.description,
          permissions: generalData.permissions,
          schema: JSON.stringify(schema),
        });
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [canSubmit, generalData, schema]);

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
                  placeholder="My module does cool things"
                  loading={isLoading}
                  name="description"
                />
              </form>
            </CollapseList.Item>

            <CollapseList.Item title="Permissions">
              {fields.length === 0 && (
                <Alert
                  variant="info"
                  title="What are permissions?"
                  action={{
                    execute: () => addField({ permission: 'My_Permission', description: '', friendlyName: '' }),
                    text: 'Add first permission',
                  }}
                  text={`
                  Permissions are a way to control who can use the items inside your module or control the behavior of
                  functions inside your module. For example, if you have a command that only admins should be able to
                  use, you can create a permission for it and then check for it to the command. Or, you might want to
                  have different behavior for different groups of players (e.g. regular players vs donators)`}
                />
              )}
              {fields.length > 0 && (
                <PermissionList>
                  {fields.map((field, index: number) => (
                    <PermissionField
                      control={control}
                      id={field.id}
                      remove={removeField}
                      key={field.id}
                      index={index}
                    />
                  ))}
                </PermissionList>
              )}
              {fields.length > 0 && (
                <Button
                  onClick={(_e) => {
                    addField({
                      permission: 'My_Permission',
                      description: '',
                      friendlyName: '',
                    });
                  }}
                  type="button"
                  icon={<PlusIcon />}
                  fullWidth
                  text="New permission"
                ></Button>
              )}
            </CollapseList.Item>

            <CollapseList.Item title="Config">
              <SchemaGenerator
                initialSchema={(mod?.configSchema && JSON.parse(mod.configSchema)) || undefined}
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
                setCanSubmit(true);
              }}
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

interface PermissionFieldProps {
  control: Control<IFormInputs>;
  id: string;
  index: number;
  remove: UseFieldArrayRemove;
}

const PermissionField: FC<PermissionFieldProps> = ({ index, id, remove, control }) => {
  const permissionName = useWatch({ control, name: `permissions.${index}.permission` });
  return (
    <PermissionCard key={id} data-testid={`permission-${index}`}>
      <Title>
        <div className="inner">
          <Chip color="primary" label={`Permission: ${index + 1}`} />
          <h3>{permissionName}</h3>
        </div>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton
              onClick={() => remove(index)}
              icon={<RemoveIcon size={16} cursor="pointer" />}
              ariaLabel="Remove permission"
            />
          </Tooltip.Trigger>
          <Tooltip.Content>Remove</Tooltip.Content>
        </Tooltip>
      </Title>
      <Fields>
        <TextField
          label="Name"
          control={control}
          name={`permissions.${index}.permission`}
          description="This is the permission code name, what you will need to check for inside the module code"
          required
        />
        <TextField
          control={control}
          label="Description"
          name={`permissions.${index}.description`}
          placeholder=""
          required
        />
        <TextField
          control={control}
          label="Friendly name"
          name={`permissions.${index}.friendlyName`}
          description="This is the name that will be shown when editing permissions of a role"
          required
        />
      </Fields>
    </PermissionCard>
  );
};
