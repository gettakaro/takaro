---
title: FAQ
sidebar_position: 20
---

# Frequently asked questions

## What will happen to CSMM?

CSMM will continue to be maintained for the foreseeable future. Once Takaro is more mature and becomes widely used, CSMM will be deprecated and eventually discontinued.
There is no time frame for this at the moment, we plan to 'go with the flow', if we notice more people are using Takaro than CSMM, we will start the deprecation process.
This will most likely coincide with the release of a new Alpha version of 7 Days to Die.

## Can I transfer my CSMM data to Takaro?

Yes, you can. We have created a tool to migrate your CSMM data to Takaro. In CSMM, go to your server settings, scroll down to the experiments section and click on the 'export' button. This will download a JSON data-dump.

In Takaro, go to the servers overview and click the import from CSMM button. Paste the JSON and submit the form.

**This data migration is a best-effort. Not everything in CSMM can map one-to-one to Takaro. Custom hooks, commands and
  cronjobs from CSMM are not compatible with Takaro. No modules will be enabled by default, you will have to enable them.

We recommend you to use this migration tool only if you have a lot of data in CSMM that you want to keep. If you are
just starting out, we recommend you to start fresh with Takaro.**

## Takaro roles are completely different than CSMM roles, how does that work?

Roles work differently in Takaro than in CSMM. In CSMM, roles are assigned a 'level' which establishes a hierarchy; a lower number indicates a higher rank, with 0 being the superadmin/root level.
Permissions in CSMM are typically configured to require a role level lower than a specific threshold, such as 1000.

Takaro, however, approaches roles differently:

- In Takaro, roles do not have a 'level'. Instead, they are composed of 'permissions'.
- These permissions determine what actions can be performed within the Takaro API. You can refer to the [Takaro API Documentation](https://docs.takaro.io/api-docs/enums/_takaro_apiclient.PERMISSIONS.html) for details on built-in permissions.
- Modules in Takaro can also define their own permissions. These permissions are automatically integrated into the roles.
- An example of this can be seen on the role editing page in Takaro, where module-specific permissions are listed.

Thus, while CSMM uses a level-based system for roles, Takaro utilizes a permission-based approach, offering a different and more granular control over user capabilities.

[More information on Takaro roles can be found in the documentation](./roles-and-permissions.md).

## Whoah, these custom modules are so complicated, CSMM was much easier to use!?

We agree, CSMM was much easier to get started with. However, CSMM was also very limited in what it could do. Takaro is much more flexible, modular and powerful, but that comes at the cost of some complexity.

The idea is that 99% of users will never need to write a custom module. The built-in modules should be sufficient for most use cases. If you do need to write a custom module, you will need to have some programming experience.

We know there is stuff to be added to the built-in modules, and we are working on that. If you have any suggestions, please let us know on Discord!

## How do I enable Discord role synchronization?

To sync Discord and Takaro roles:

1. Connect Discord bot in **Settings → Discord**
2. Users link accounts at `/link`
3. Map roles in **Roles** → edit → select Discord role
4. Enable sync in **Settings → Game Servers**
5. Choose who controls roles (Takaro or Discord)

See the [Discord Integration guide](./advanced/discord-integration.md) for details.

## What happens when Discord and Takaro roles conflict?

Your "Source of Truth" setting decides which platform wins. With Takaro controls (default), Takaro roles take precedence. With Discord controls, Discord roles take precedence.

Only mapped roles sync. Unmapped roles stay independent.

## Can I sync roles for specific game servers only?

Yes! Discord role synchronization can be configured per domain. Each Takaro domain (which can contain multiple game servers) has its own sync settings. This means:

- You can enable sync for some domains while keeping it disabled for others
- Different domains can have different source of truth settings
- Role mappings are domain-specific, so the same Discord role can map to different Takaro roles in different domains

## Why isn't Discord role sync working for a user?

Common issues and solutions:

1. **User hasn't linked Discord**: Check if the user has connected their Discord account at `/link`
2. **Bot permissions**: Ensure the bot has "Manage Roles" permission and is positioned above the roles it needs to manage
3. **Role not mapped**: Verify the role has a Discord role selected in its configuration
4. **Sync disabled**: Check that role sync is enabled in Settings → Game Servers
5. **User not in Discord server**: The user must be a member of the Discord server where the role exists

Check the Takaro logs for specific error messages related to role synchronization.
