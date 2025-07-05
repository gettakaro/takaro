import { FC, useEffect, useState } from 'react';
import {
  Button,
  SelectField,
  TextField,
  Drawer,
  CollapseList,
  FormError,
  styled,
  Switch,
  Loading,
} from '@takaro/lib-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IFormInputs, validationSchema } from './validationSchema';
import { GameServerOutputDTO, GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { connectionInfoFieldsMap } from './connectionInfoFieldsMap';
import { useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { userMeQueryOptions } from '../../../../queries/user';
import { getCurrentDomain } from '../../../../util/getCurrentDomain';

interface CreateUpdateFormProps {
  initialData?: GameServerOutputDTO;
  isLoading?: boolean;
  onSubmit: SubmitHandler<IFormInputs>;
  error: string | string[] | null;
}

const gameTypeSelectOptions = [
  {
    name: 'Mock (testing purposes)',
    value: GameServerCreateDTOTypeEnum.Mock,
  },
  {
    name: 'Rust',
    value: GameServerCreateDTOTypeEnum.Rust,
  },
  {
    name: '7 Days to die',
    value: GameServerCreateDTOTypeEnum.Sevendaystodie,
  },
  {
    name: 'Generic',
    value: GameServerCreateDTOTypeEnum.Generic,
  },
];

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const CreateUpdateForm: FC<CreateUpdateFormProps> = ({ initialData, isLoading = false, onSubmit, error }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const { data: meData, isLoading: isLoadingMe } = useQuery(userMeQueryOptions());

  const { control, handleSubmit, watch, trigger, formState } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      type: '',
      enabled: true,
    },
    ...(initialData && {
      values: {
        name: initialData.name,
        enabled: initialData.enabled,
        type: initialData.type,
        connectionInfo: initialData.connectionInfo,
      },
    }),
  });

  const { type } = watch();

  useEffect(() => {
    if (!open) {
      navigate({ to: '/gameservers' });
    }
  }, [open]);

  const formId = 'gameserver-form';

  function getConnectionInfoFields() {
    if (!type) {
      return null;
    }

    if (isLoadingMe || !meData) return <Loading />;
    const currentDomain = getCurrentDomain(meData);

    if (type === GameServerCreateDTOTypeEnum.Generic) {
      return (
        <>
          <p>
            The generic type is the new way of adding servers to Takaro. You do not need to manually add the server
            here. For all supported games, there are game mods. You install this mod on your server, and it will
            automatically connect to Takaro.
          </p>
          <p>
            Your registration token is: <strong>{currentDomain.serverRegistrationToken}</strong>
          </p>
        </>
      );
    }

    return connectionInfoFieldsMap(isLoading, control)[type];
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>{initialData ? 'Update' : 'Create'} Game Server</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id={formId}>
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Server name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool server"
                  required
                />
                <Switch
                  label="Enabled"
                  name="enabled"
                  key="enabled"
                  description="If disabled, Takaro will not interact with this server. You can retain all settings and data, but Takaro will not update any data or connect to the server."
                  control={control}
                  loading={isLoading}
                />
                <SelectField
                  control={control}
                  name="type"
                  label="Game Server Type"
                  required
                  loading={isLoading}
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return <div>Select...</div>;
                    }
                    return <div>{selectedItems[0].label}</div>;
                  }}
                >
                  <SelectField.OptionGroup label="Games">
                    {gameTypeSelectOptions.map(({ name, value }) => (
                      <SelectField.Option key={`select-${name}`} value={value} label={name}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </SelectField.Option>
                    ))}
                  </SelectField.OptionGroup>
                </SelectField>
              </CollapseList.Item>
              <CollapseList.Item title="Connection info">{getConnectionInfoFields()}</CollapseList.Item>
            </form>
          </CollapseList>
          {error && <FormError error={error} />}
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button onClick={() => setOpen(false)} color="background" type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              onClick={() => trigger()}
              form={formId}
              disabled={type === GameServerCreateDTOTypeEnum.Generic}
            >
              Save changes
            </Button>
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
