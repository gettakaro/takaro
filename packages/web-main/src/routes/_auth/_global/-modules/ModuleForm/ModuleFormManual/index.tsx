import { FC, useEffect, useState } from 'react';
import { ModuleFormProps } from '..';
import {
  Button,
  CollapseList,
  Drawer,
  FormError,
  IconTooltip,
  TextAreaField,
  TextField,
  SelectField,
  useTheme,
} from '@takaro/lib-components';
import { PermissionCreateDTO } from '@takaro/apiclient';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { PermissionField } from '../PermissionField/PermissionField';
import { PermissionList, ButtonContainer } from '../style';
import { AiOutlinePlus as PlusIcon, AiOutlineQuestion as QuestionIcon } from 'react-icons/ai';
import { useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchema } from './validationSchema';
import { UncontrolledModuleVersionSelectQueryField } from '../../../../../../components/selects';

interface IFormInputs {
  name: string;
  description: string;
  author?: string;
  supportedGames?: string[];
  permissions: PermissionCreateDTO[];
  configSchema: string;
  uiSchema: string;
}

export const ModuleFormManual: FC<ModuleFormProps> = ({
  moduleName,
  moduleAuthor,
  moduleSupportedGames,
  moduleVersion,
  error,
  onSubmit,
  isLoading,
}) => {
  const readOnly = onSubmit ? false : true;
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();

  const { control, formState, handleSubmit } = useForm<IFormInputs>({
    mode: 'onChange',
    values: {
      name: moduleName ?? '',
      description: moduleVersion?.description ?? '',
      author: moduleAuthor ?? '',
      supportedGames: moduleSupportedGames ?? ['all'],
      permissions: moduleVersion?.permissions ?? [],
      configSchema: moduleVersion?.configSchema ? JSON.stringify(JSON.parse(moduleVersion.configSchema), null, 2) : '',
      uiSchema: moduleVersion?.uiSchema ? JSON.stringify(JSON.parse(moduleVersion.uiSchema), null, 2) : '',
    },
    resolver: zodResolver(validationSchema),
  });

  const submitHandler: SubmitHandler<IFormInputs> = ({
    name,
    description,
    author,
    supportedGames,
    permissions,
    configSchema,
    uiSchema,
  }) => {
    onSubmit!({
      name,
      description,
      author,
      supportedGames,
      permissions,
      schema: JSON.stringify(JSON.parse(configSchema)),
      uiSchema: JSON.stringify(JSON.parse(uiSchema)),
    });
  };

  function getTitle() {
    if (moduleVersion) {
      return readOnly ? 'View module' : 'Edit module';
    }
    return 'Create module';
  }

  const {
    fields: permissionFields,
    append: addPermissionField,
    remove: removePermissionField,
  } = useFieldArray({
    control: control,
    name: 'permissions',
  });

  useEffect(() => {
    if (!open) {
      navigate({ to: '/modules' });
    }
  }, [open, navigate]);

  const handleOnSelectedVersionChanged = (selectedModuleVersionTag: string) => {
    navigate({
      to: '/modules/$moduleId/view/$moduleVersionTag',
      params: { moduleId: moduleVersion!.moduleId, moduleVersionTag: selectedModuleVersionTag },
      search: { view: 'manual' },
    });
  };

  const formId = 'module-form-manual';

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={readOnly === false && formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>{getTitle()}</Drawer.Heading>
        <Drawer.Body>
          {onSubmit == undefined && moduleVersion && (
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

          <form id={formId} onSubmit={handleSubmit(submitHandler)}>
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
                <TextAreaField
                  control={control}
                  loading={isLoading}
                  name="configSchema"
                  label="Config Schema (JSON Schema)"
                  readOnly={readOnly}
                  required
                  description="Learn more about how to write the JSON Schema (https://json-schema.org/learn)"
                  rows={10}
                />
                <TextAreaField
                  control={control}
                  loading={isLoading}
                  name="uiSchema"
                  label="UI Schema"
                  readOnly={readOnly}
                  description="Provides information on how the form should be rendered. Read more on https://docs.takaro.io/advanced/modules#custom-rendering-fields-uischema"
                  rows={10}
                />
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
              <Button type="submit" form={formId} fullWidth>
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
