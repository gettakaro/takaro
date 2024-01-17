import { FC, Fragment, useEffect, useState } from 'react';
import { Control, UseFieldArrayRemove, useForm, useWatch, useFieldArray, SubmitHandler } from 'react-hook-form';
import {
  Button,
  TextField,
  Drawer,
  CollapseList,
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
import { moduleValidationSchema } from './moduleValidationSchema';
import { ModuleOutputDTO, ModuleOutputDTOAPI, PermissionCreateDTO } from '@takaro/apiclient';
import { Title, Fields, PermissionCard, PermissionList, ButtonContainer } from './style';
import { AiOutlineDelete as RemoveIcon, AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { AxiosError } from 'axios';
import { Input, InputType } from 'components/JsonSchemaForm/generator/inputTypes';
import { schemaToInputs } from 'components/JsonSchemaForm/generator/SchemaToInputs';
import { inputsToSchema, inputsToUiSchema } from 'components/JsonSchemaForm/generator/inputsToSchema';
import { ConfigField } from './ConfigField';
import { Divider } from '@ory/elements';

export interface IFormInputs {
  name: string;
  description?: string;
  permissions: PermissionCreateDTO[];
  configFields: Input[];
}

export interface ModuleFormSubmitProps {
  name: string;
  description?: string;
  permissions: PermissionCreateDTO[];
  schema: string;
  uiSchema: string;
}

interface ModuleFormProps {
  mod?: ModuleOutputDTO;
  isLoading: boolean;
  isSuccess: boolean;
  onSubmit: (data: ModuleFormSubmitProps) => void;
  error: AxiosError<ModuleOutputDTOAPI, any> | null;
}

export const ModuleForm: FC<ModuleFormProps> = ({ mod, isSuccess, onSubmit, isLoading, error }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { handleSubmit, control, resetField } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
    defaultValues: {
      name: mod?.name ?? undefined,
      description: mod?.description ?? undefined,
      permissions: mod?.permissions ?? undefined,
      configFields: mod ? schemaToInputs(JSON.parse(mod.configSchema), JSON.parse(mod.uiSchema)) : [],
    },
  });

  const {
    fields: permissionFields,
    append: addPermissionField,
    remove: removePermissionField,
  } = useFieldArray({
    control: control,
    name: 'permissions',
  });

  const {
    append: addConfigField,
    fields: configFields,
    remove: removeConfigField,
  } = useFieldArray({
    control: control,
    name: 'configFields',
  });

  useEffect(() => {
    if (isSuccess) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [isSuccess]);

  const submitHandler: SubmitHandler<IFormInputs> = ({ configFields, name, description, permissions }) => {
    const schema = inputsToSchema(configFields);
    const uiSchema = inputsToUiSchema(configFields);
    onSubmit({
      name,
      description,
      permissions,
      schema: JSON.stringify(schema),
      uiSchema: JSON.stringify(uiSchema),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Edit Module</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={handleSubmit(submitHandler)}>
            <CollapseList>
              <CollapseList.Item title="General">
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
              </CollapseList.Item>

              <CollapseList.Item title="Permissions">
                {permissionFields.length === 0 && (
                  <Alert
                    variant="info"
                    title="What are permissions?"
                    action={{
                      execute: () =>
                        addPermissionField({ permission: 'My_Permission', description: '', friendlyName: '' }),
                      text: 'Add first permission',
                    }}
                    text={`
                  Permissions are a way to control who can use the items inside your module or control the behavior of
                  functions inside your module. For example, if you have a command that only admins should be able to
                  use, you can create a permission for it and then check for it to the command. Or, you might want to
                  have different behavior for different groups of players (e.g. regular players vs donators)`}
                  />
                )}
                {permissionFields.length > 0 && (
                  <PermissionList>
                    {permissionFields.map((field, index: number) => (
                      <PermissionField
                        control={control}
                        id={field.id}
                        remove={removePermissionField}
                        key={field.id}
                        index={index}
                      />
                    ))}
                  </PermissionList>
                )}
                {permissionFields.length > 0 && (
                  <Button
                    onClick={(_e) => {
                      addPermissionField({
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
                {configFields.length === 0 && (
                  <Alert
                    variant="info"
                    title="What are Config fields?"
                    action={{
                      execute: () =>
                        addConfigField({
                          name: `Config field ${configFields.length + 1}`,
                          type: InputType.string,
                          description: '',
                          required: false,
                        }),
                      text: 'Add first config field',
                    }}
                    text={`Config fields are a way to control the behavior of your module. When a module is installed
                  on a game server, Config fields can be tweaked to change the behavior of the module. For example,
                  if you want to write a module that allows players to teleport to each other, you might want to have a config
                  field that controls the cooldown of the command.
                `}
                  />
                )}

                {configFields.length > 0 && (
                  <Alert text="Every config field name should be unique!" variant="warning" />
                )}
                {configFields.map((field, index) => {
                  return (
                    <Fragment key={`config-field-wrapper-${field.id}`}>
                      <ConfigField
                        key={`config-field-${field.id}`}
                        id={field.id}
                        input={field as any} /* TODO: fix this type*/
                        control={control}
                        index={index}
                        remove={removeConfigField}
                        resetField={resetField}
                      />
                      {index != configFields.length - 1 && <Divider key={`config-field-divider-${field.id}`} />}
                    </Fragment>
                  );
                })}
                {configFields.length > 0 && (
                  <Button
                    text="Config Field"
                    type="button"
                    fullWidth
                    icon={<PlusIcon />}
                    onClick={() => {
                      addConfigField({
                        name: `Config field ${configFields.length + 1}`,
                        type: InputType.string,
                        description: '',
                        required: false,
                      });
                    }}
                  />
                )}
                {/* TODO: There is currently a bug in react-hook-form regarding refine, which in our case breaks the 
        unique name validation. So for now we just add note to the user that the name must be unique 
        issue: https://github.com/react-hook-form/resolvers/issues/538#issuecomment-1504222680
        */}
              </CollapseList.Item>
            </CollapseList>
            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button fullWidth text="Save changes" />
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
