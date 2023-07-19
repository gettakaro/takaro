
## Roles and permissions

In Takaro, roles are flexible and customizable according to the needs of the users. To start with, Takaro provides a set of default roles like 'admin' and 'moderator' These roles serve as a foundation upon which users can build and customize their roles.

The roles consist of multiple permissions. Permissions in Takaro can be built-in, like `MANAGE_MODULES` or `READ_PLAYERS`, or dynamic. Dynamic permissions allow for a high degree of customization. They can be created based on installed/configured modules. For example, a dynamic permission could be created to allow only moderators to set public teleports, or to allow only VIP users to be rewarded for zombie kills.

Roles can be assigned to Users, Players, and PlayerOnGameservers. User roles define what actions users can take on the API/dashboard of Takaro. Player and PlayerOnGameserver roles control what actions can be taken in-game.

Player roles are applicable across all game servers. However, if a role is set on the PlayerOnGameserver model, it overrides the Player role. Here, 'override' means that the permissions set at the PlayerOnGameserver level take precedence over the permissions at the Player level. In other words, the permissions for a player on a specific game server are a combination of their Player role permissions and their PlayerOnGameserver role permissions, with the latter taking precedence in case of any conflict. This allows for game server-specific customization of roles and permissions.

## Data models

![Roles and permissions](../assets/roles-and-permissions.png)

### User

A 'User' in Takaro represents a 'dashboard user' who can log into the Takaro dashboard. They have the permissions associated with the roles assigned to them. These permissions govern their ability to access and manipulate data via the dashboard or API. 

### Player

The 'Player' model represents an individual who plays on game servers. Key attributes include a unique 'playerId', and a list of 'ids' that link it to the PlayerOnGameserver model. These IDs can be Steam IDs, Xbox Live IDs, or other game service IDs, depending on what platforms the game servers support.

### PlayerOnGameserver

A 'PlayerOnGameserver' represents a player's profile on a specific game server. This model contains game server-specific data including 'inventory', 'location', and any other relevant data specific to a game server. It also includes 'gameServerId' to denote the specific game server, and 'playerId' to link back to the global Player model.

### Role

The 'Role' model represents a collection of permissions. A role could be something like 'admin', 'moderator', or 'vip'. Key attributes for this model include 'name' for the name of the role, and 'permissions' that includes the permissions assigned to the role.

### Permission

The 'Permission' model represents an individual permission that can be assigned to a role. This could be a built-in permission like `MANAGE_MODULES` or `READ_PLAYERS`, or a dynamic permission like `COMMAND_TP_ALLOW`. 

Each command will have a permission and hooks will also have the ability to limit execution based on rol

### Relation tables

#### PermissionOnRole

This table links permissions to roles. It contains 'roleId' and 'permissionId' columns. Permissions are assigned to roles by creating entries in this table with the appropriate role and permission IDs.

#### RoleOnUser, RoleOnPlayer, RoleOnPlayerOnGameserver

These tables link roles to users, players, and PlayerOnGameserver respectively. Each table contains two columns, one for the ID of the entity (User, Player, or PlayerOnGameserver), and one for the 'roleId'. Roles are assigned to entities by creating entries in these tables with the appropriate entity and role IDs. This allows for a flexible system where any entity can have any combination of roles.

## Security Implications

Security is a crucial aspect of the role and permission system. Permissions should be designed and assigned carefully to avoid granting excessive authority to roles. For example, the `MANAGE_MODULES` permission should ideally only be granted to an 'admin' role and not a 'moderator' role.

Dynamic permissions provide flexibility but also increase complexity
