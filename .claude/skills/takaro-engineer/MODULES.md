# Module System

## Overview

Modules are the core extensibility mechanism. They contain commands, hooks, and cron jobs.

Location: `packages/lib-modules/src/modules/`

## Built-in Modules

| Module | Purpose |
|--------|---------|
| utils | ping, help commands |
| teleports | Player teleportation |
| gimme | Random item distribution |
| economyUtils | Currency management |
| serverMessages | Automated server messages |
| geoBlock | IP-based access control |
| highPingKicker | Kick high-latency players |
| playerOnboarding | Welcome new players |
| chatBridge | Discord-game chat sync |
| lottery | Lottery system |
| dailyRewards | Daily login bonuses |

## Module Structure

```typescript
export class MyModule extends ModuleTransferDTO<MyModule> {
  constructor() {
    super();
    this.name = 'mymodule';
    this.author = 'Takaro';
    this.supportedGames = ['all'];  // or specific: ['rust', '7 days to die']
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.1',
        description: 'Description',
        configSchema: JSON.stringify({...}),  // JSON Schema
        commands: [...],
        hooks: [...],
        cronJobs: [...],
        permissions: [...],
      }),
    ];
  }
}
```

## Commands

```typescript
new ICommand({
  name: 'ping',
  trigger: 'ping',                        // Player types: /ping
  helpText: 'Replies with pong',
  function: this.loadFn('commands', 'ping'),
  arguments: [
    {
      name: 'message',
      type: 'string',
      position: 0,
      helpText: 'Optional message',
    },
  ],
})
```

Implementation (`modules/mymodule/commands/ping.js`):

```javascript
import { data } from '@takaro/helpers';

async function main() {
  await data.player.pm('Pong!');
}

await main();
```

## Hooks

```typescript
new IHook({
  name: 'onPlayerConnect',
  eventType: HookEvents.PLAYER_CONNECTED,
  function: this.loadFn('hooks', 'onPlayerConnect'),
})
```

### Available Events

**Game Events:**
- `player-connected`, `player-disconnected`
- `chat-message`
- `player-death`, `entity-killed`
- `log`

**Takaro Events:**
- `role-assigned`, `command-executed`
- `player-new-ip-detected`
- `module-installed`, `module-uninstalled`
- `currency-added`, `currency-deducted`

## Cron Jobs

```typescript
new ICronJob({
  name: 'hourlyCheck',
  temporalValue: '0 * * * *',  // Cron expression
  function: this.loadFn('cronJobs', 'hourlyCheck'),
})
```

## Permissions

```typescript
new IPermission({
  permission: 'MY_PERMISSION',
  friendlyName: 'My Permission',
  description: 'Allows something',
  canHaveCount: true,  // Permission can have numeric value
})
```

## Configuration

### userConfig (Player-facing)

Defined via JSON Schema:

```typescript
configSchema: JSON.stringify({
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    timeout: {
      type: 'number',
      default: 1000,
      description: 'Timeout in ms',
    },
    enabled: {
      type: 'boolean',
      default: true,
    },
  },
})
```

### systemConfig (Auto-generated)

Generated automatically, controls:
- enabled/disabled per command/hook/cron
- cooldowns, delays, costs
- command aliases

## Testing Modules

### Setup

```typescript
import { IntegrationTest, modulesTestSetup, IModuleTestsSetupData } from '@takaro/test';

new IntegrationTest<IModuleTestsSetupData>({
  group: 'My Module',
  setup: modulesTestSetup,
  test: async function () {
    // Install module
    await this.client.module.moduleInstallationsControllerInstallModule({
      gameServerId: this.setupData.gameserver.id,
      versionId: this.setupData.utilsModule.latestVersion.id,
    });

    // Trigger command
    await this.client.command.commandControllerTrigger(
      this.setupData.gameserver.id,
      {
        msg: '/ping',
        playerId: this.setupData.players[0].id,
      }
    );
  },
});
```

### EventsAwaiter

For async event testing:

```typescript
import { EventsAwaiter } from '@takaro/test';

const awaiter = new EventsAwaiter();
await awaiter.connect(this.client);

const events = awaiter.waitForEvents('chat-message', 1);
// trigger action...
const result = await events;
expect(result[0].data.meta.msg).to.eq('Pong!');
```

### Run Tests

```bash
npm run test:file packages/lib-modules/src/__tests__/ping.integration.test.ts
npm run test:package lib-modules
```

## Installation API

```typescript
// Install
await client.module.moduleInstallationsControllerInstallModule({
  gameServerId: 'uuid',
  versionId: 'uuid',
  userConfig: JSON.stringify({...}),
  systemConfig: JSON.stringify({...}),
});

// Uninstall
await client.module.moduleInstallationsControllerUninstallModule(moduleId, gameServerId);
```

## File Locations

| What | Where |
|------|-------|
| Module definitions | `packages/lib-modules/src/modules/` |
| Event types | `packages/lib-modules/src/dto/` |
| Module service | `packages/app-api/src/service/Module/` |
| Module tests | `packages/lib-modules/src/__tests__/` |
| Test setup | `packages/test/src/setups/modulesSetup.ts` |
