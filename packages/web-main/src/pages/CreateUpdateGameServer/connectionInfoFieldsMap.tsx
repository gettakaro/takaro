import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { TextField, Switch } from '@takaro/lib-components';
import { Control } from 'react-hook-form';

export const connectionInfoFieldsMap = (isLoading: boolean, control: Control<any>) => {
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
      <>
        <Switch
          label="Use CPM"
          name="connectionInfo.useCPM"
          key="seven-days-to-die-use-cpm"
          control={control}
          loading={isLoading}
          description="CPM is a helper mod for 7 Days to Die. Download at https://cpm.7d2d.download"
          required
        />
      </>,
    ],
    [GameServerCreateDTOTypeEnum.Mock]: [
      <TextField
        control={control}
        label="Host"
        name="connectionInfo.host"
        description="Where the deployed mock server is running"
        placeholder="http://127.0.0.1:3002"
        key="mock-event-host"
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
