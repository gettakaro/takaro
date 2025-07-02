

<p align="center">
  <img align="center" src="https://github.com/gettakaro/takaro/blob/main/logo.png?raw=true" width="200" height="200" />
  <h2 align="center">Takaro</h2>
</p>

Takaro is a web-based, multi-gameserver manager. It features a web interface to manage your gameservers, and a REST API to interact with them. For detailed information, visit our [documentation](https://docs.takaro.io).

## Modules

The core of Takaro is built around Modules. Modules offer a very powerful and flexible way of creating features.

Here are some examples:

- **AFK-kick module**: tracks player activity and automatically removes inactive players.

- **Teleport module**: offers set of in-game commands enabling players to create their own teleport points and teleport to them.

- **Economy utils module**: introduces a virtual currency, actively engaging players in earning and spending currency. Players can accumulate currency through diverse activities. E.g. defeating entities, earning daily login rewards and participating in bounty hunting. Additionally, players can transact currency among themselves or use it to purchase items from a customizable shop. 
- **Bounty module**: builds upon the Economy module, this feature allows players to set bounties on other players. When a player with a bounty is defeated, the bounty reward is transferred to the victor. 



### Custom modules
The above modules represent only a **tiny fraction** of the modules maintained by the Takaro team. 
To explore all the modules we offer, visit our [full List of Built-In Modules](https://docs.takaro.io/modules/overview)

If however the current modules don't cater to your specific needs, don't worry. Takaro also provides a development environment to create your own custom modules.


## Testing

Takaro includes helpful test scripts to make running tests easier:

### Quick Test Commands

```bash
# Run a specific test file
npm run test:file packages/lib-config/src/__tests__/config.unit.test.ts

# Run test with TypeScript checking first
npm run test:file:check packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts

# Debug a test file (connects debugger)
npm run test:debug packages/lib-modules/src/__tests__/ping.integration.test.ts

# Test a specific package
PKG=lib-config npm run test:package
PKG=app-api npm run test:package:integration

# Run all tests of a type
npm run test:unit          # All unit tests
npm run test:integration   # All integration tests
npm test                   # All tests

# Check TypeScript in test files
npm run test:check
```

These scripts provide:
- **Readable**: Simple npm commands instead of complex shell commands
- **TypeScript Support**: Clear error messages with `--check` options
- **Debugging**: Easy debugging with `test:debug`
- **Package-focused**: Easy testing of individual packages

## Contributions
We welcome contributions from the community! Whether you're a developer, designer, or gamer, your input can help shape the future of Takaro. 

### Code contributions
Begin your journey with Takaro's development by visiting our [Getting started](https://docs.takaro.io/development/getting-started) guide.
