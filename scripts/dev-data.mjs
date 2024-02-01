#!/bin/node

import { Client, AdminClient, isAxiosError, GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  url: process.env.TAKARO_HOST,
  auth: {
    clientId: process.env.ADMIN_CLIENT_ID,
    clientSecret: process.env.ADMIN_CLIENT_SECRET,
  },
  OAuth2URL: process.env.TAKARO_OAUTH_HOST,
  log: false,
  gameservers: {
    rust: {
      connectionInfo: {
        host: process.env.TAKARO_DEV_RUST_HOST,
        rconPort: process.env.TAKARO_DEV_RUST_PORT,
        rconPassword: process.env.TAKARO_DEV_RUST_RCON_PASSWORD,
      },
    },
    sdtd: {
      connectionInfo: {
        host: process.env.TAKARO_DEV_SDTD_HOST,
        adminUser: process.env.TAKARO_DEV_SDTD_ADMIN_USER,
        adminToken: process.env.TAKARO_DEV_SDTD_ADMIN_PASSWORD,
        useTls: true,
      },
    },
  },
  moduleConfigs: {
    chatBridge: {
      enabled: process.env.TAKARO_DEV_CHAT_BRIDGE_ENABLED !== 'false',
      systemConfig: {
        hooks: {
          ['DiscordToGame Discord channel ID']: process.env.TAKARO_DEV_CHAT_BRIDGE_CHANNEL_ID,
        },
      },
      userConfig: {
        allowBotMessage: process.env.TAKARO_DEV_CHAT_BRIDGE_ALLOW_BOT_MESSAGE,
      },
    },
  },
};

const adminClient = new AdminClient({
  url: config.url,
  auth: {
    clientId: config.auth.clientId,
    clientSecret: config.auth.clientSecret,
  },
  OAuth2URL: config.OAuth2URL,
  log: false,
});

/**
 *
 * @param {ModuleOutputDTO} mod
 */
async function resolveCustomModuleConfig(mod) {
  const returnValue = {
    systemConfig: {},
    userConfig: {},
  };

  if (mod.builtin in config.moduleConfigs) {
    const modConfig = config.moduleConfigs[mod.builtin];

    if ('systemConfig' in modConfig) {
      returnValue.systemConfig = modConfig.systemConfig;
    }

    if ('userConfig' in modConfig) {
      returnValue.userConfig = modConfig.userConfig;
    }
  }

  return {
    systemConfig: JSON.stringify(returnValue.systemConfig),
    userConfig: JSON.stringify(returnValue.userConfig),
  };
}

async function main() {
  const userEmail = `${process.env.TAKARO_DEV_USER_NAME}@${process.env.TAKARO_DEV_DOMAIN_NAME}`;

  const domainRes = await adminClient.domain.domainControllerCreate({
    name: process.env.TAKARO_DEV_DOMAIN_NAME,
  });

  console.log(`Created a domain with id ${domainRes.data.data.createdDomain.id}`);
  console.log(`Root user: ${domainRes.data.data.rootUser.email} / ${domainRes.data.data.password}`);

  const client = new Client({
    url: process.env.TAKARO_HOST,
    auth: {
      username: domainRes.data.data.rootUser.email,
      password: domainRes.data.data.password,
    },
    log: false,
  });

  await client.login();

  const userRes = await client.user.userControllerCreate({
    email: userEmail,
    password: process.env.TAKARO_DEV_USER_PASSWORD,
    name: process.env.TAKARO_DEV_USER_NAME,
  });

  console.log(`Created a user: ${userRes.data.data.email} / ${process.env.TAKARO_DEV_USER_PASSWORD}`);

  await client.user.userControllerAssignRole(userRes.data.data.id, domainRes.data.data.rootRole.id);
  /* 
    await client.settings.settingsControllerSet('commandPrefix', {
      value: '&'
    });
   */
  const gameserver = (
    await client.gameserver.gameServerControllerCreate({
      name: 'Test server',
      type: GameServerCreateDTOTypeEnum.Mock,
      connectionInfo: JSON.stringify({
        host: 'http://127.0.0.1:3002',
      }),
    })
  ).data.data;

  console.log(`Created a mock gameserver with id ${gameserver.id}`);

  const modules = (await client.module.moduleControllerSearch()).data.data;

  for (const mod of modules) {
    const customConfig = await resolveCustomModuleConfig(mod);
    try {
      if (!(config.moduleConfigs[mod.builtin]?.enabled ?? true)) {
        console.log(`Skipping module ${mod.name} because it is disabled`);
        continue;
      }
      console.log(`Installing module ${mod.name}`);
      await client.gameserver.gameServerControllerInstallModule(gameserver.id, mod.id, customConfig);
      console.log(`Installed module ${mod.name}`, customConfig);
    } catch (error) {
      console.error(`🔴 Error installing module ${mod.builtin}`, {
        config: customConfig,
        response: JSON.stringify(error.response.data),
      });
    }
  }

  if (config.gameservers.rust.connectionInfo.host) {
    try {
      await client.gameserver.gameServerControllerCreate({
        name: 'Rust',
        type: GameServerCreateDTOTypeEnum.Rust,
        connectionInfo: JSON.stringify(config.gameservers.rust.connectionInfo),
      });
      console.log('🎮 Added Rust server');
    } catch (error) {
      console.error('🔴 Error creating Rust gameserver', {
        config: config.gameservers.rust.connectionInfo,
        response: JSON.stringify(error.response.data),
      });
    }
  }

  if (config.gameservers.sdtd.connectionInfo.host) {
    try {
      await client.gameserver.gameServerControllerCreate({
        name: '7 Days to Die',
        type: GameServerCreateDTOTypeEnum.Sevendaystodie,
        connectionInfo: JSON.stringify(config.gameservers.sdtd.connectionInfo),
      });
      console.log('🎮 Added 7 days to die server');
    } catch (error) {
      console.error('🔴 Error creating 7 Days to Die gameserver', {
        config: config.gameservers.sdtd.connectionInfo,
        response: JSON.stringify(error.response.data),
      });
    }
  }
}

main().catch((e) => {
  if (isAxiosError(e)) {
    console.error(JSON.stringify(e.response.data, null, 2));
  } else {
    console.error(e);
  }
  process.exit(1);
});
