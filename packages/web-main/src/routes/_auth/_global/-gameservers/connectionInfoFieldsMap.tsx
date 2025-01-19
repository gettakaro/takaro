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
      <Switch
        label="Use TLS"
        name="connectionInfo.useTls"
        key="seven-days-to-die-use-tls"
        description="TLS encrypts traffic between Takaro and your gameserver. Before you can use this, you need to have set up TLS on your gameserver! This typically involves setting up a reverse proxy like Nginx"
        control={control}
        loading={isLoading}
      />,
      <Switch
        label="Use CPM"
        name="connectionInfo.useCPM"
        key="seven-days-to-die-use-cpm"
        control={control}
        loading={isLoading}
        description="CPM is a helper mod for 7 Days to Die. Download at https://cpm.7d2d.download"
      />,
      <Switch
        label="Use legacy connection method"
        name="connectionInfo.useLegacy"
        key="seven-days-to-die-use-legacy"
        control={control}
        loading={isLoading}
        description="Use the old, pre-v1 connection method. Only use this if you are running an old version of 7 Days to Die (eg for modding)"
      />,
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
        required
      />,
      <TextField
        control={control}
        label="Name"
        name="connectionInfo.name"
        description="A name for the mock server, this can be used to have 'multiple' mock servers"
        placeholder="mock1"
        key="mock-event-name"
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
      <Switch
        label="Use TLS"
        name="connectionInfo.useTls"
        description="TLS encrypts traffic between Takaro and your gameserver. Before you can use this, you need to have set up TLS on your gameserver! This typically involves setting up a reverse proxy like Nginx"
        key="use-tls"
        control={control}
        loading={isLoading}
      />,
    ],
    [GameServerCreateDTOTypeEnum.Generic]: [
      <TextField
        control={control}
        label="Code"
        name="connectionInfo.code"
        placeholder="secret-value-abcdefhijklmnop"
        key="generic-code"
        loading={isLoading}
        required
      />,
    ],
  };
};
