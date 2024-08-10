import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import {
  Button,
  TextField,
  Drawer,
  CollapseList,
  TextAreaField,
  FormError,
  QuestionTooltip,
  useTheme,
} from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchema } from './validationSchema';
import { useNavigate } from '@tanstack/react-router';
import { ModuleOutputDTO, PermissionCreateDTO } from '@takaro/apiclient';
import { PermissionList, ButtonContainer } from './style';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { AnyInput, InputType } from '../schemaConversion/inputTypes';
import { schemaToInputs } from '../schemaConversion/SchemaToInputs';
import { inputsToSchema, inputsToUiSchema } from '../schemaConversion/inputsToSchema';
import { ConfigField } from './ConfigField';
import { Divider } from '@ory/elements';
import { PermissionField } from './PermissionField';
import { ConfigFieldErrorDetail } from './ConfigFieldErrorDetail';

export interface IFormInputs {
  name: string;
  description?: string;
  permissions: PermissionCreateDTO[];
  configFields: AnyInput[];
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
  isLoading?: boolean;
  onSubmit: (data: ModuleFormSubmitProps) => void;
  error: string | string[] | null;
}

export const ModuleForm: FC<ModuleFormProps> = ({ mod, onSubmit, isLoading = false, error }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const readOnly = !onSubmit;

  useEffect(() => {
    if (!open) {
      navigate({ to: '/modules' });
    }
  }, [open, navigate]);

  const { initialConfigFields, configFieldErrors } = useMemo(() => {
    if (mod) {
      const { inputs, errors } = schemaToInputs(JSON.parse(mod.configSchema));
      return { initialConfigFields: inputs, configFieldErrors: errors };
    }
    return { initialConfigFields: [], configFieldErrors: [] };
  }, [mod]);

  const { handleSubmit, control, resetField } = useForm<IFormInputs>({
    mode: 'onChange',
    defaultValues: {
      name: mod?.name ?? undefined,
      description: mod?.description ?? undefined,
      permissions: mod?.permissions ?? undefined,
      configFields: initialConfigFields,
    },
    resolver: zodResolver(validationSchema),
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

  function getTitle() {
    if (mod) {
      return readOnly ? 'View module' : 'Edit module';
    }
    return 'Create module';
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>{getTitle()}</Drawer.Heading>
        <Drawer.Body>
          <form id="module-definition" onSubmit={handleSubmit(submitHandler)}>
            <CollapseList>
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool module"
                  required
                  readOnly={readOnly}
                />
                <TextAreaField
                  control={control}
                  label="Description"
                  placeholder="My module does cool things"
                  loading={isLoading}
                  name="description"
                  readOnly={readOnly}
                />
              </CollapseList.Item>

              <CollapseList.Item
                title={
                  <>
                    Permissions
                    <QuestionTooltip>
                      Permissions are a way to control who can use the items inside your module or control the behavior
                      of functions inside your module. For example, if you have a command that only admins should be
                      able to use, you can create a permission for it and then check for it to the command. Or, you
                      might want to have different behavior for different groups of players (e.g. regular players vs
                      donators)
                    </QuestionTooltip>
                  </>
                }
              >
                {permissionFields.length > 0 && (
                  <PermissionList>
                    {permissionFields.map((field, index: number) => (
                      <PermissionField
                        control={control}
                        id={field.id}
                        remove={removePermissionField}
                        key={field.id}
                        readOnly={readOnly}
                        index={index}
                      />
                    ))}
                  </PermissionList>
                )}

                {!readOnly && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: theme.spacing['1'],
                      marginBottom: theme.spacing['2'],
                    }}
                  >
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<PlusIcon />}
                      onClick={(_e) => {
                        addPermissionField({
                          permission: `PERMISSION_${permissionFields.length + 1}`,
                          description: '',
                          friendlyName: '',
                        });
                      }}
                      type="button"
                      text="Create new permission"
                    />
                  </div>
                )}
              </CollapseList.Item>

              <CollapseList.Item
                title={
                  <>
                    Config
                    <QuestionTooltip>
                      Config fields are a way to control the behavior of your module. When a module is installed on a
                      game server, Config fields can be tweaked to change the behavior of the module. For example, if
                      you want to write a module that allows players to teleport to each other, you might want to have a
                      config field that controls the cooldown of the command.
                    </QuestionTooltip>
                  </>
                }
              >
                {configFieldErrors.map((error, index) => {
                  return (
                    <ConfigFieldErrorDetail
                      key={`config-field-error-${index}`}
                      data={error.data}
                      detail={error.detail}
                      title={error.message}
                    />
                  );
                })}

                {configFields.map((field, index) => {
                  return (
                    <Fragment key={`config-field-wrapper-${field.id}`}>
                      <ConfigField
                        key={`config-field-${field.id}`}
                        id={field.id}
                        input={field}
                        control={control}
                        index={index}
                        readOnly={readOnly}
                        remove={removeConfigField}
                        resetField={resetField}
                      />
                      {index != configFields.length - 1 && <Divider key={`config-field-divider-${field.id}`} />}
                    </Fragment>
                  );
                })}

                {!readOnly && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: theme.spacing['1'],
                      marginBottom: theme.spacing['2'],
                    }}
                  >
                    <Button
                      text="Create new config field"
                      type="button"
                      icon={<PlusIcon />}
                      variant="outline"
                      color="primary"
                      fullWidth
                      onClick={() => {
                        addConfigField({
                          name: `Config field ${configFields.length + 1}`,
                          type: InputType.text,
                          description: '',
                          required: false,
                        });
                      }}
                    />
                  </div>
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
          {!readOnly ? (
            <ButtonContainer>
              <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
              <Button type="submit" form="module-definition" fullWidth text="Save changes" />
            </ButtonContainer>
          ) : (
            <Button text="Close view" fullWidth onClick={() => setOpen(false)} color="primary" />
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
