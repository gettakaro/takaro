import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { send } from '@takaro/email';

import { UserModel, UserRepo } from '../db/user.js';
import { IsEmail, IsISO8601, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
import { RoleService, UserAssignmentOutputDTO } from './RoleService.js';
import { Type } from 'class-transformer';
import { ory } from '@takaro/auth';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { TakaroEventRoleAssigned, TakaroEventRoleRemoved } from '@takaro/modules';

export class UserOutputDTO extends TakaroModelDTO<UserOutputDTO> {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  idpId: string;

  @IsString()
  @IsOptional()
  discordId?: string;

  @IsISO8601()
  lastSeen: string;
}

export class UserOutputWithRolesDTO extends UserOutputDTO {
  @Type(() => UserAssignmentOutputDTO)
  @ValidateNested({ each: true })
  roles: UserAssignmentOutputDTO[];
}
export class UserCreateInputDTO extends TakaroDTO<UserCreateInputDTO> {
  @Length(3, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsString()
  @IsOptional()
  idpId?: string;
}

export class UserUpdateDTO extends TakaroDTO<UserUpdateDTO> {
  @IsString()
  @Length(3, 50)
  @IsOptional()
  name?: string;
}

export class UserUpdateAuthDTO extends TakaroDTO<UserUpdateAuthDTO> {
  @IsString()
  @IsOptional()
  @Length(18, 18)
  discordId?: string;

  @IsISO8601()
  @IsOptional()
  lastSeen?: string;
}

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
      roles.results.map((role) => new UserAssignmentOutputDTO({ role, roleId: role.id, userId: user.id }))
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

  async find(filters: ITakaroQuery<UserOutputDTO>) {
    const result = await this.repo.find(filters);
    const extendedWithOry = {
      ...result,
      results: await Promise.all(result.results.map(this.extend.bind(this))),
    };

    return extendedWithOry;
  }

  async findOne(id: string) {
    const user = await this.repo.findOne(id);
    return this.extend.bind(this)(user);
  }

  async create(user: UserCreateInputDTO): Promise<UserOutputDTO> {
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
    await ory.deleteIdentity(id);
    return id;
  }

  async assignRole(roleId: string, userId: string, expiresAt?: string): Promise<void> {
    const eventService = new EventService(this.domainId);
    const roleService = new RoleService(this.domainId);

    const role = await roleService.findOne(roleId);
    if (!role) throw new errors.NotFoundError(`Role ${roleId} not found`);

    await this.repo.assignRole(userId, roleId, expiresAt);
    await eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_ASSIGNED,
        userId,
        meta: new TakaroEventRoleAssigned({ role: { id: role.id, name: role.name } }),
      })
    );
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
      })
    );
  }

  async inviteUser(email: string): Promise<UserOutputDTO> {
    const user = await this.create(new UserCreateInputDTO({ email, name: email }));
    const recoveryFlow = await ory.getRecoveryFlow(user.idpId);

    await send({
      address: email,
      template: 'invite',
      data: {
        inviteLink: recoveryFlow.recovery_link,
      },
    });

    return user;
  }
}
