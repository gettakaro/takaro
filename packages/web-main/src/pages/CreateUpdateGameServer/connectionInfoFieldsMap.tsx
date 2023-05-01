import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { TextField, Switch } from '@takaro/lib-components';
import { IFormInputs as ICreateFormInputs } from './GameServerCreate';
import { IFormInputs as IUpdateFormInputs } from './GameServerUpdate';
import { Control } from 'react-hook-form';

export const connectionInfoFieldsMap = (
  isLoading: boolean,
  control: Control<any>
) => {
  return {
    [GameServerCreateDTOTypeEnum.Sevendaystodie]: [
      <TextField
        control={control}
        label="IP (or FQDN), including port"
        name="connectionInfo.host"
        placeholder="12.34.56.78:1234"
        key="seven-days-to-die-host"
        loading={isLoading}
        required
      />,
      <TextField
        control={control}
        label="Admin user"
        name="connectionInfo.adminUser"
        key="seven-days-to-die-admin-user"
        loading={isLoading}
        required
      />,
      <TextField
        control={control}
        label="Admin token"
        name="connectionInfo.adminToken"
        type="password"
        key="seven-days-to-die-admin-token"
        loading={isLoading}
        required
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          key="seven-days-to-die-use-tls"
          control={control}
          loading={isLoading}
          required
        />
      </>,
    ],
    [GameServerCreateDTOTypeEnum.Mock]: [
      <TextField
        control={control}
        label="Event interval"
        name="connectionInfo.eventInterval"
        description="How often the server should send events to the backend (in ms)"
        placeholder="500"
        type="number"
        key="mock-event-interval"
        loading={isLoading}
        required
      />,
      <TextField
        control={control}
        label="Player pool size"
        name="connectionInfo.playerPoolSize"
        description="How large is the pool of fake players"
        placeholder="200"
        type="number"
        key="mock-player-pool-size"
        loading={isLoading}
        required
      />,
    ],
    [GameServerCreateDTOTypeEnum.Rust]: [
      <TextField
        control={control}
        label="Server IP"
        name="connectionInfo.host"
        placeholder="12.34.56.78"
        key="rust-server-ip"
        loading={isLoading}
        required
      />,
      <TextField
        control={control}
        label="RCON Port"
        name="connectionInfo.rconPort"
        key="rust-rcon-port"
        type="number"
        loading={isLoading}
        required
      />,
      <TextField
        control={control}
        label="RCON Password"
        name="connectionInfo.rconPassword"
        type="password"
        key="rust-rcon-password"
        loading={isLoading}
        required
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          key="use-tls"
          control={control}
          loading={isLoading}
          required
        />
      </>,
    ],
  };
};
