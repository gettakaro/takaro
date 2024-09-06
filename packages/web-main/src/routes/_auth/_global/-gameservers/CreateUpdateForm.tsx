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
} from '@takaro/lib-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IFormInputs, validationSchema } from './validationSchema';
import {
  GameServerOutputDTO,
  GameServerTestReachabilityInputDTOTypeEnum,
  GameServerCreateDTOTypeEnum,
} from '@takaro/apiclient';
import { useGameServerReachabilityByConfig } from 'queries/gameserver';
import { connectionInfoFieldsMap } from './connectionInfoFieldsMap';
import { useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';

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
];

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const CreateUpdateForm: FC<CreateUpdateFormProps> = ({ initialData, isLoading = false, onSubmit, error }) => {
  const [open, setOpen] = useState(true);
  const [connectionOk, setConnectionOk] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { mutateAsync: testReachabilityMutation, isPending: testingConnection } = useGameServerReachabilityByConfig();
  const navigate = useNavigate();

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

  const { type, connectionInfo } = watch();

  useEffect(() => {
    if (!open) {
      navigate({ to: '/gameservers' });
    }
  }, [open]);

  const clickTestReachability = async () => {
    const response = await testReachabilityMutation({
      type: type as GameServerTestReachabilityInputDTOTypeEnum,
      connectionInfo: JSON.stringify(connectionInfo),
    });

    if (response.connectable) {
      setConnectionOk(true);
      setConnectionError(null);
    } else {
      setConnectionError(response.reason || 'Connection error');
    }
  };

  const formId = 'gameserver-form';
  return (
    <Drawer open={open} onOpenChange={setOpen}>
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
                  description="If disabled, Takaro will not interact with this server. You can retain all settings and data, but Takaro will not update any data or interact with the server."
                  control={control}
                  loading={isLoading}
                />
                <SelectField
                  control={control}
                  name="type"
                  label="Game Server"
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
              <CollapseList.Item title="Connection info">
                {type && connectionInfoFieldsMap(isLoading, control)[type]}
              </CollapseList.Item>
            </form>
          </CollapseList>
          {connectionError && <FormError error={connectionError} />}
          {error && <FormError error={error} />}
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" type="button" />
            <Button
              fullWidth
              disabled={!formState.isValid}
              isLoading={testingConnection}
              onClick={clickTestReachability}
              text="Test connection"
            />
            {connectionOk && (
              <Button type="submit" fullWidth onClick={() => trigger()} text="Save changes" form={formId} />
            )}
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
