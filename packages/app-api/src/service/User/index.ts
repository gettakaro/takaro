import { TakaroService } from '../Base.js';
import { Redis } from '@takaro/db';
import { send } from '@takaro/email';

import { UserModel, UserRepo } from '../../db/user.js';
import { errors, traceableClass } from '@takaro/util';
import { RoleService, UserAssignmentOutputDTO } from '../RoleService.js';
import { ory } from '@takaro/auth';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../EventService.js';
import { HookEvents, TakaroEventPlayerLinked, TakaroEventRoleAssigned, TakaroEventRoleRemoved } from '@takaro/modules';
import { AuthenticatedRequest } from '../AuthService.js';
import { UserOutputDTO, UserCreateInputDTO, UserUpdateDTO, UserOutputWithRolesDTO, UserUpdateAuthDTO } from './dto.js';
import { UserSearchInputDTO } from '../../controllers/UserController.js';
import { DomainService } from '../DomainService.js';
import { PlayerService } from '../Player/index.js';
import { DiscordService } from '../DiscordService.js';

export * from './dto.js';

@traceableClass('service:user')
export class UserService extends TakaroService<UserModel, UserOutputDTO, UserCreateInputDTO, UserUpdateDTO> {
  constructor(domainId: string) {
    super(domainId);
  }

  get repo() {
    return new UserRepo(this.domainId);
  }

  private async extend(user: UserOutputWithRolesDTO): Promise<UserOutputWithRolesDTO> {
    await this.handleRoleExpiry(user);

    const oryIdentity = await ory.getIdentity(user.idpId);
    const withOry = new UserOutputWithRolesDTO({
      ...user,
      email: oryIdentity.email,
    });

    const roleService = new RoleService(this.domainId);
    const roles = await roleService.find({ filters: { name: ['User'] } });
    const assignments = await Promise.all(
      roles.results.map((role) => new UserAssignmentOutputDTO({ role, roleId: role.id, userId: user.id })),
    );
    withOry.roles.push(...assignments);
    return withOry;
  }

  private async handleRoleExpiry(user: UserOutputWithRolesDTO): Promise<UserOutputWithRolesDTO> {
    const now = new Date();
    const expired = user.roles.filter((role) => role.expiresAt && new Date(role.expiresAt) < now);
    if (expired.length) this.log.info('Removing expired roles', { expired: expired.map((role) => role.roleId) });
    await Promise.all(expired.map((role) => this.removeRole(role.roleId, user.id)));

    // Delete expired roles from original object
    user.roles = user.roles.filter((role) => !expired.find((expiredRole) => expiredRole.roleId === role.roleId));
    return user;
  }

  async find(filters: Partial<UserSearchInputDTO>) {
    // Everyone has the User and Player roles by default
    // Filtering by these roles would be redundant
    if (filters.filters?.roleId) {
      const roleService = new RoleService(this.domainId);
      const role = await roleService.findOne(filters.filters.roleId[0]);
      if ((role?.name === 'Player' || role?.name === 'User') && role.system) {
        delete filters.filters.roleId;
      }
    }
    const result = await this.repo.find(filters);

    const withPlayers = await Promise.all(
      result.results.map(async (item) => {
        if (item.playerId) {
          const player = await new PlayerService(this.domainId).findOne(item.playerId);
          return new UserOutputWithRolesDTO({ ...item, player });
        } else {
          return new UserOutputWithRolesDTO(item);
        }
      }),
    );

    const extendedWithOry = {
      ...result,
      results: await Promise.all(withPlayers.map(this.extend.bind(this))),
    };

    return extendedWithOry;
  }

  async findOne(id: string) {
    const user = await this.repo.findOne(id);
    return this.extend.bind(this)(user);
  }

  async create(user: UserCreateInputDTO): Promise<UserOutputDTO> {
    if (user.isDashboardUser) {
      const domain = await new DomainService().findOne(this.domainId);
      if (!domain) throw new errors.NotFoundError(`Domain ${this.domainId} not found`);

      const maxUsers = domain.maxUsers;
      const existingDashboardUsers = await this.repo.find({ filters: { isDashboardUser: [true] } });
      if (existingDashboardUsers.total >= maxUsers) {
        throw new errors.BadRequestError(`Max users (${maxUsers}) limit reached`);
      }
    }
    const idpUser = await ory.createIdentity(user.email, user.password);
    user.idpId = idpUser.id;
    const createdUser = await this.repo.create(user);
    return this.extend.bind(this)(createdUser);
  }

  async update(id: string, data: UserUpdateAuthDTO | UserUpdateDTO): Promise<UserOutputDTO> {
    await this.repo.update(id, data);
    return this.extend.bind(this)(await this.repo.findOne(id));
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async assignRole(roleId: string, userId: string, expiresAt?: string): Promise<void> {
    const eventService = new EventService(this.domainId);
    const roleService = new RoleService(this.domainId);

    const role = await roleService.findOne(roleId);
    if (!role) throw new errors.NotFoundError(`Role ${roleId} not found`);

    if ((role?.name === 'Player' || role?.name === 'User') && role.system) {
      throw new errors.BadRequestError('Cannot assign Player or User role, everyone has these by default');
    }

    await this.repo.assignRole(userId, roleId, expiresAt);
    await eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_ASSIGNED,
        userId,
        meta: new TakaroEventRoleAssigned({ role: { id: role.id, name: role.name } }),
      }),
    );

    // Sync Discord roles if enabled
    try {
      const discordService = new DiscordService(this.domainId);
      await discordService.syncUserRoles(userId);
    } catch (error) {
      // Log error but don't throw - we don't want to break role assignment
      this.log.error('Failed to sync Discord roles after role assignment', {
        userId,
        roleId,
        error,
      });
    }
  }

  async removeRole(roleId: string, userId: string): Promise<void> {
    const eventService = new EventService(this.domainId);
    const roleService = new RoleService(this.domainId);
    const role = await roleService.findOne(roleId);
    if (!role) throw new errors.NotFoundError(`Role ${roleId} not found`);

    await this.repo.removeRole(userId, roleId);

    await eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_REMOVED,
        userId,
        meta: new TakaroEventRoleRemoved({ role: { id: role.id, name: role.name } }),
      }),
    );

    // Sync Discord roles if enabled
    try {
      const discordService = new DiscordService(this.domainId);
      await discordService.syncUserRoles(userId);
    } catch (error) {
      // Log error but don't throw - we don't want to break role removal
      this.log.error('Failed to sync Discord roles after role removal', {
        userId,
        roleId,
        error,
      });
    }
  }

  async inviteUser(email: string, opts = { isDashboardUser: true }): Promise<UserOutputDTO> {
    const existingIdpProfile = await ory.getIdentityByEmail(email);

    const user = await this.create(
      new UserCreateInputDTO({ email, name: email, isDashboardUser: opts.isDashboardUser }),
    );
    if (!existingIdpProfile) {
      const recoveryFlow = await ory.getRecoveryFlow(user.idpId);

      await send({
        address: email,
        template: 'invite',
        data: {
          inviteLink: recoveryFlow.recovery_link,
        },
      });
    }

    return user;
  }

  async NOT_DOMAIN_SCOPED_linkPlayerProfile(
    req: AuthenticatedRequest,
    email: string,
    code: string,
  ): Promise<{ user: UserOutputDTO; domainId: string }> {
    const redis = await Redis.getClient('playerLink');
    const resolvedPlayerId = await redis.get(`playerLink:${code}`);
    const resolvedDomainId = await redis.get(`playerLink:${code}-domain`);

    if (!resolvedPlayerId) {
      this.log.warn('Player link code not found', { code });
      throw new errors.BadRequestError('Invalid player link code. Please verify the code and try again.');
    }

    if (!resolvedDomainId) {
      this.log.warn('Player link code domain mismatch', { code, domainId: resolvedDomainId });
      throw new errors.ForbiddenError();
    }

    const existingIdpProfile = await ory.getIdentityByEmail(email);
    const loggedInUser = await ory.getIdentityFromReq(req);

    if (existingIdpProfile && loggedInUser) {
      if (existingIdpProfile.id !== loggedInUser.id) {
        this.log.warn('Tried to link with a different user than what is authed now', { email });
        throw new errors.BadRequestError('Email already in use, please login with the correct user first');
      }
    }

    if (!loggedInUser && existingIdpProfile) {
      this.log.warn('Tried to link an existing user but not logged in', { email });
      throw new errors.BadRequestError('Email already in use, please login first');
    }

    // We drop the un-domain-scope here and create a new service with the resolved domainId
    const userService = new UserService(resolvedDomainId);
    let user: UserOutputDTO;

    if (existingIdpProfile) {
      const maybeUser = await userService.find({ filters: { idpId: [existingIdpProfile.id] } });
      if (maybeUser.results.length === 0) {
        user = await userService.inviteUser(email, { isDashboardUser: false });
      } else {
        user = maybeUser.results[0];
      }
    } else {
      user = await userService.inviteUser(email, { isDashboardUser: false });
    }

    await userService.repo.linkPlayer(user.id, resolvedPlayerId);
    await redis.del(code);

    const eventService = new EventService(resolvedDomainId);
    await eventService.create(
      new EventCreateDTO({
        eventName: HookEvents.PLAYER_LINKED,
        playerId: resolvedPlayerId,
        userId: user.id,
        meta: new TakaroEventPlayerLinked(),
      }),
    );

    return { user, domainId: resolvedDomainId };
  }
}
