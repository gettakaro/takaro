import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import {
  Button,
  TextField,
  Drawer,
  CollapseList,
  TextAreaField,
  SelectField,
  FormError,
  IconTooltip,
  useTheme,
} from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchema } from './validationSchema';
import { useNavigate } from '@tanstack/react-router';
import { PermissionCreateDTO } from '@takaro/apiclient';
import { PermissionList, ButtonContainer } from '../style';
import { AiOutlinePlus as PlusIcon, AiOutlineQuestion as QuestionIcon } from 'react-icons/ai';
import { AnyInput, InputType } from '../../schemaConversion/inputTypes';
import { schemaToInputs } from '../../schemaConversion/SchemaToInputs';
import { inputsToSchema, inputsToUiSchema } from '../../schemaConversion/inputsToSchema';
import { ConfigField } from './ConfigField';
import { Divider } from '@ory/elements';
import { PermissionField } from '../PermissionField/PermissionField';
import { ConfigFieldErrorDetail } from './ConfigFieldErrorDetail';
import { ModuleFormProps } from '..';
import { UncontrolledModuleVersionSelectQueryField } from '../../../../../../components/selects';

export interface IFormInputs {
  name: string;
  description: string;
  author?: string;
  supportedGames?: string[];
  permissions: PermissionCreateDTO[];
  configFields: AnyInput[];
}

export const ModuleFormBuilder: FC<ModuleFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  moduleName,
  moduleAuthor,
  moduleSupportedGames,
  moduleVersion,
}) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const readOnly = onSubmit ? false : true;

  const { initialConfigFields, configFieldErrors } = useMemo(() => {
    if (moduleVersion) {
      const { inputs, errors } = schemaToInputs(JSON.parse(moduleVersion.configSchema));
      return { initialConfigFields: inputs, configFieldErrors: errors };
    }
    return { initialConfigFields: [], configFieldErrors: [] };
  }, [moduleVersion]);

  const { handleSubmit, control, resetField, formState } = useForm<IFormInputs>({
    mode: 'onChange',
    values: {
      name: moduleName ?? '',
      description: moduleVersion?.description ?? '',
      author: moduleAuthor ?? '',
      supportedGames: moduleSupportedGames ?? ['all'],
      permissions: moduleVersion?.permissions ?? [],
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

  useEffect(() => {
    if (!open) {
      navigate({ to: '/modules' });
    }
  }, [open, navigate]);

  const submitHandler: SubmitHandler<IFormInputs> = ({
    configFields,
    name,
    description,
    author,
    supportedGames,
    permissions,
  }) => {
    const schema = inputsToSchema(configFields);
    const uiSchema = inputsToUiSchema(configFields);
    onSubmit!({
      name,
      description,
      author,
      supportedGames,
      permissions,
      schema: JSON.stringify(schema),
      uiSchema: JSON.stringify(uiSchema),
    });
  };

  function getTitle() {
    if (moduleVersion) {
      return readOnly ? 'View module' : 'Edit module';
    }
    return 'Create module';
  }

  const handleOnSelectedVersionChanged = (selectedModuleVersionTag: string) => {
    navigate({
      to: '/modules/$moduleId/view/$moduleVersionTag',
      params: { moduleId: moduleVersion!.moduleId, moduleVersionTag: selectedModuleVersionTag },
      search: { view: 'builder' },
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={readOnly === false && formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>{getTitle()}</Drawer.Heading>
        <Drawer.Body>
          {!onSubmit && moduleVersion && (
            <div style={{ marginBottom: '30px' }}>
              <UncontrolledModuleVersionSelectQueryField
                moduleId={moduleVersion.moduleId}
                canClear={false}
                onChange={handleOnSelectedVersionChanged}
                name="module-version-tag-select"
                value={moduleVersion.tag}
              />
            </div>
          )}

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
                <TextField
                  control={control}
                  label="Author"
                  placeholder="Your name or organization"
                  loading={isLoading}
                  name="author"
                  readOnly={readOnly}
                />
                <SelectField
                  control={control}
                  label="Supported Games"
                  name="supportedGames"
                  multiple={true}
                  readOnly={readOnly}
                  loading={isLoading}
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) return 'Select supported games';
                    return selectedItems.map((item) => item.label).join(', ');
                  }}
                >
                  <SelectField.OptionGroup>
                    <SelectField.Option value="all" label="All Games">
                      <div>
                        <span>All Games</span>
                      </div>
                    </SelectField.Option>
                    <SelectField.Option value="minecraft" label="Minecraft">
                      <div>
                        <span>Minecraft</span>
                      </div>
                    </SelectField.Option>
                    <SelectField.Option value="7 days to die" label="7 Days to Die">
                      <div>
                        <span>7 Days to Die</span>
                      </div>
                    </SelectField.Option>
                    <SelectField.Option value="rust" label="Rust">
                      <div>
                        <span>Rust</span>
                      </div>
                    </SelectField.Option>
                    <SelectField.Option value="other" label="Other">
                      <div>
                        <span>Other</span>
                      </div>
                    </SelectField.Option>
                  </SelectField.OptionGroup>
                </SelectField>
              </CollapseList.Item>

              <CollapseList.Item
                title={
                  <>
                    Permissions
                    <IconTooltip color="background" icon={<QuestionIcon />}>
                      Permissions are a way to control who can use the items inside your module or control the behavior
                      of functions inside your module. For example, if you have a command that only admins should be
                      able to use, you can create a permission for it and then check for it to the command. Or, you
                      might want to have different behavior for different groups of players (e.g. regular players vs
                      donators)
                    </IconTooltip>
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
                    >
                      Create new permission
                    </Button>
                  </div>
                )}
              </CollapseList.Item>

              <CollapseList.Item
                title={
                  <>
                    Config
                    <IconTooltip color="background" icon={<QuestionIcon />}>
                      Config fields are a way to control the behavior of your module. When a module is installed on a
                      game server, Config fields can be tweaked to change the behavior of the module. For example, if
                      you want to write a module that allows players to teleport to each other, you might want to have a
                      config field that controls the cooldown of the command.
                    </IconTooltip>
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
                    >
                      Create new config field
                    </Button>
                  </div>
                )}
                {/* TODO: There is currently a bug in react-hook-form regarding refine, which in our case breaks the 
        unique name validation of config fields. So for now we just add note to the user that the name must be unique 
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
              <Button onClick={() => setOpen(false)} color="background">
                Cancel
              </Button>
              <Button type="submit" form="module-definition" fullWidth>
                Save changes
              </Button>
            </ButtonContainer>
          ) : (
            <Button fullWidth onClick={() => setOpen(false)} color="primary">
              Close view
            </Button>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
