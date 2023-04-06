import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { TextField, Switch } from '@takaro/lib-components';
import { IFormInputs } from '.';
import { Control } from 'react-hook-form';

export const connectionInfoFieldsMap = (
  isLoading: boolean,
  control: Control<IFormInputs>
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
      />,
      <TextField
        control={control}
        label="Admin user"
        name="connectionInfo.adminUser"
        key="seven-days-to-die-admin-user"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="Admin token"
        name="connectionInfo.adminToken"
        type="password"
        key="seven-days-to-die-admin-token"
        loading={isLoading}
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          key="seven-days-to-die-use-tls"
          control={control}
          loading={isLoading}
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
        key="mock-event-interval"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="Player pool size"
        name="connectionInfo.playerPoolSize"
        description="How large is the pool of fake players"
        placeholder="200"
        key="mock-player-pool-size"
        loading={isLoading}
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
      />,
      <TextField
        control={control}
        label="RCON Port"
        name="connectionInfo.rconPort"
        key="rust-rcon-port"
        type="number"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="RCON Password"
        name="connectionInfo.rconPassword"
        type="password"
        key="rust-rcon-password"
        loading={isLoading}
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          key="use-tls"
          control={control}
          loading={isLoading}
        />
      </>,
    ],
  };
};
