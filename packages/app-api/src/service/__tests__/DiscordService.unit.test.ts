import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from '@takaro/test';
import { DiscordService, GuildOutputDTO } from '../DiscordService.js';
import { UserService, UserOutputDTO, UserOutputWithRolesDTO } from '../User/index.js';
import { RoleService, RoleOutputDTO, UserAssignmentOutputDTO } from '../RoleService.js';
import { SettingsService, SettingsOutputDTO, SETTINGS_KEYS, SettingsMode } from '../SettingsService.js';
import { discordBot } from '../../lib/DiscordBot.js';
import sinon from 'sinon';
import type { SinonSandbox, SinonStubbedInstance } from 'sinon';
import { TakaroEventRoleAssigned, TakaroEventRoleRemoved, TakaroEventRoleMeta } from '@takaro/modules';
import { GuildMember, Role } from 'discord.js';

describe('DiscordService', () => {
  let sandbox: SinonSandbox;
  let service: DiscordService;
  let mockUserService: SinonStubbedInstance<UserService>;
  let mockRoleService: SinonStubbedInstance<RoleService>;
  let mockSettingsService: SinonStubbedInstance<SettingsService>;

  const domainId = 'test-domain-id';
  const guildId = '123456789012345678';

  // Test data fixtures
  const mockUser = new UserOutputDTO({
    id: 'user-1',
    name: 'Test User',
    discordId: '987654321098765432',
    idpId: 'idp-123',
    email: 'test@example.com',
    lastSeen: new Date().toISOString(),
    player: null,
    isDashboardUser: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const mockUserWithoutDiscord = new UserOutputDTO({
    ...mockUser.toJSON(),
    id: 'user-2',
    discordId: undefined,
  });

  const mockTakaroRole = new RoleOutputDTO({
    id: 'role-1',
    name: 'Admin',
    linkedDiscordRoleId: '111111111111111111',
    permissions: [],
    system: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const mockTakaroRoleWithoutLink = new RoleOutputDTO({
    ...mockTakaroRole.toJSON(),
    id: 'role-2',
    name: 'Player',
    linkedDiscordRoleId: undefined,
  });

  const mockDiscordRoles = [
    { id: '111111111111111111', name: 'Discord Admin', color: 0xff0000 } as Role,
    { id: '222222222222222222', name: 'Discord Mod', color: 0x00ff00 } as Role,
  ];

  const mockGuild = new GuildOutputDTO({
    id: 'guild-1',
    discordId: guildId,
    name: 'Test Guild',
    takaroEnabled: true,
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock all external dependencies
    mockUserService = sandbox.createStubInstance(UserService);
    mockRoleService = sandbox.createStubInstance(RoleService);
    mockSettingsService = sandbox.createStubInstance(SettingsService);

    // Mock Discord bot methods (these need to be set up before each test)
    sandbox.stub(discordBot, 'getGuildRoles').resolves(mockDiscordRoles);
    sandbox.stub(discordBot, 'assignRole').resolves();
    sandbox.stub(discordBot, 'removeRole').resolves();

    // Default settings
    mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
      new SettingsOutputDTO({
        key: SETTINGS_KEYS.discordRoleSyncEnabled,
        value: 'true',
        type: SettingsMode.Override,
        description: 'Enable or disable automatic role synchronization between Discord and Takaro',
        canHaveGameServerOverride: false,
      }),
    );
    mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
      new SettingsOutputDTO({
        key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
        value: 'false',
        type: SettingsMode.Override,
        description: 'When true, Discord roles take precedence during conflicts',
        canHaveGameServerOverride: false,
      }),
    );

    service = new DiscordService(domainId);

    // Stub the constructor calls that happen inside DiscordService methods
    sandbox.stub(UserService.prototype, 'findOne').callsFake(function (this: UserService, id: string) {
      return mockUserService.findOne(id);
    });
    sandbox.stub(UserService.prototype, 'find').callsFake(function (this: UserService, filters?: any) {
      return mockUserService.find(filters);
    });
    sandbox.stub(UserService.prototype, 'assignRole').callsFake(function (
      this: UserService,
      roleId: string,
      userId: string,
    ) {
      return mockUserService.assignRole(roleId, userId);
    });
    sandbox.stub(UserService.prototype, 'removeRole').callsFake(function (
      this: UserService,
      roleId: string,
      userId: string,
    ) {
      return mockUserService.removeRole(roleId, userId);
    });
    sandbox.stub(RoleService.prototype, 'find').callsFake(function (this: RoleService, filters?: any) {
      return mockRoleService.find(filters);
    });
    sandbox.stub(RoleService.prototype, 'findOne').callsFake(function (this: RoleService, id: string) {
      return mockRoleService.findOne(id);
    });
    sandbox.stub(SettingsService.prototype, 'get').callsFake(function (this: SettingsService, key: SETTINGS_KEYS) {
      return mockSettingsService.get(key);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('syncUserRoles', () => {
    it('should skip users without Discord ID', async () => {
      // Create a stub for getMemberRoles to check it's not called
      const getMemberRolesStub = sandbox.stub(discordBot, 'getMemberRoles');

      mockUserService.findOne.resolves(mockUserWithoutDiscord as UserOutputWithRolesDTO);

      const result = await service.syncUserRoles('user-2');

      expect(result).to.deep.equal({
        rolesAdded: 0,
        rolesRemoved: 0,
      });

      expect(getMemberRolesStub).not.to.have.been.called;
    });

    it('should skip when Discord sync is disabled', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'false',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );
      mockUserService.findOne.resolves(mockUser as UserOutputWithRolesDTO);

      const result = await service.syncUserRoles('user-1');

      expect(result).to.deep.equal({
        rolesAdded: 0,
        rolesRemoved: 0,
      });
    });

    it('should sync roles with Takaro as source of truth', async () => {
      // Setup getMemberRoles stub for this test
      sandbox.stub(discordBot, 'getMemberRoles').resolves(['222222222222222222']); // User has different role in Discord

      // Setup - mock user with roles attached
      const userWithRoles = Object.assign(new UserOutputWithRolesDTO(), mockUser.toJSON(), {
        roles: [
          new UserAssignmentOutputDTO({
            userId: mockUser.id,
            roleId: mockTakaroRole.id,
            role: mockTakaroRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        ],
      });
      mockUserService.findOne.resolves(userWithRoles);

      mockRoleService.find.resolves({
        results: [
          mockTakaroRole,
          new RoleOutputDTO({ ...mockTakaroRole.toJSON(), id: 'role-2', linkedDiscordRoleId: '222222222222222222' }),
        ],
        total: 2,
      });

      // Find guild by discordId
      sandbox.stub(service, 'find').resolves({
        results: [mockGuild],
        total: 1,
      });

      const result = await service.syncUserRoles('user-1');

      // Should add Admin role to Discord and remove Mod role
      expect(discordBot.assignRole).to.have.been.calledWith(guildId, mockUser.discordId, '111111111111111111');
      expect(discordBot.removeRole).to.have.been.calledWith(guildId, mockUser.discordId, '222222222222222222');

      expect(result.rolesAdded).to.equal(1);
      expect(result.rolesRemoved).to.equal(1);
    });

    it('should sync roles with Discord as source of truth', async () => {
      // Setup getMemberRoles stub for this test
      sandbox.stub(discordBot, 'getMemberRoles').resolves(['111111111111111111']); // User has Admin in Discord

      // Setup
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
          value: 'true',
          type: SettingsMode.Override,
          description: 'When true, Discord roles take precedence during conflicts',
          canHaveGameServerOverride: false,
        }),
      );
      mockRoleService.find.resolves({
        results: [mockTakaroRole],
        total: 1,
      });
      const userWithRoles = Object.assign(new UserOutputWithRolesDTO(), mockUser.toJSON(), { roles: [] });
      mockUserService.findOne.resolves(userWithRoles);

      sandbox.stub(service, 'find').resolves({
        results: [mockGuild],
        total: 1,
      });

      const result = await service.syncUserRoles('user-1');

      // Should add Admin role to Takaro
      expect(mockUserService.assignRole).to.have.been.calledWith('role-1', 'user-1');
      expect(result.rolesAdded).to.equal(1);
      expect(result.rolesRemoved).to.equal(0);
    });

    it('should handle errors gracefully', async () => {
      mockUserService.findOne.rejects(new Error('Database error'));

      await expect(service.syncUserRoles('user-1')).to.be.rejectedWith('Database error');
    });

    it('should skip roles without Discord link', async () => {
      // Setup getMemberRoles stub for this test
      sandbox.stub(discordBot, 'getMemberRoles').resolves([]);

      mockRoleService.find.resolves({
        results: [mockTakaroRoleWithoutLink], // Role without Discord link
        total: 1,
      });
      const userWithRoles = Object.assign(new UserOutputWithRolesDTO(), mockUser.toJSON(), {
        roles: [
          new UserAssignmentOutputDTO({
            userId: mockUser.id,
            roleId: mockTakaroRoleWithoutLink.id,
            role: mockTakaroRoleWithoutLink,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        ],
      });
      mockUserService.findOne.resolves(userWithRoles);

      sandbox.stub(service, 'find').resolves({
        results: [mockGuild],
        total: 1,
      });

      const result = await service.syncUserRoles('user-1');

      // Should not attempt any Discord operations
      expect(discordBot.assignRole).not.to.have.been.called;
      expect(discordBot.removeRole).not.to.have.been.called;
      expect(result.rolesAdded).to.equal(0);
      expect(result.rolesRemoved).to.equal(0);
    });
  });

  describe('calculateRoleChanges', () => {
    // Note: calculateRoleChanges is a private method, so we test it indirectly through syncUserRoles

    it('should correctly calculate role changes with Takaro as source', async () => {
      // Setup scenario where user has different roles in each system
      mockUserService.findOne.resolves(mockUser as UserOutputWithRolesDTO);
      mockRoleService.find.resolves({
        results: [
          mockTakaroRole,
          new RoleOutputDTO({ ...mockTakaroRole.toJSON(), id: 'role-2', linkedDiscordRoleId: '222222222222222222' }),
        ],
        total: 2,
      });
      const userWithRoles = Object.assign(new UserOutputWithRolesDTO(), mockUser.toJSON(), {
        roles: [
          new UserAssignmentOutputDTO({
            userId: mockUser.id,
            roleId: mockTakaroRole.id,
            role: mockTakaroRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        ],
      });
      mockUserService.findOne.resolves(userWithRoles);
      sandbox.stub(discordBot, 'getMemberRoles').resolves(['222222222222222222']); // User has Mod in Discord

      sandbox.stub(service, 'find').resolves({
        results: [mockGuild],
        total: 1,
      });

      await service.syncUserRoles('user-1');

      // Should add Admin to Discord and remove Mod from Discord
      expect(discordBot.assignRole).to.have.been.calledWith(guildId, mockUser.discordId, '111111111111111111');
      expect(discordBot.removeRole).to.have.been.calledWith(guildId, mockUser.discordId, '222222222222222222');
    });

    it('should correctly calculate role changes with Discord as source', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
          value: 'true',
          type: SettingsMode.Override,
          description: 'When true, Discord roles take precedence during conflicts',
          canHaveGameServerOverride: false,
        }),
      );
      mockUserService.findOne.resolves(mockUser as UserOutputWithRolesDTO);
      mockRoleService.find.resolves({
        results: [
          mockTakaroRole,
          new RoleOutputDTO({ ...mockTakaroRole.toJSON(), id: 'role-2', linkedDiscordRoleId: '222222222222222222' }),
        ],
        total: 2,
      });
      const userWithRoles = Object.assign(new UserOutputWithRolesDTO(), mockUser.toJSON(), {
        roles: [
          new UserAssignmentOutputDTO({
            userId: mockUser.id,
            roleId: mockTakaroRole.id,
            role: mockTakaroRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        ],
      });
      mockUserService.findOne.resolves(userWithRoles);
      sandbox.stub(discordBot, 'getMemberRoles').resolves(['222222222222222222']); // User has Mod in Discord

      sandbox.stub(service, 'find').resolves({
        results: [mockGuild],
        total: 1,
      });

      await service.syncUserRoles('user-1');

      // Should remove Admin from Takaro and add Mod to Takaro
      expect(mockUserService.removeRole).to.have.been.calledWith('role-1', 'user-1');
      expect(mockUserService.assignRole).to.have.been.calledWith('role-2', 'user-1');
    });
  });

  describe('handleRoleAssignment', () => {
    const mockEvent = new TakaroEventRoleAssigned({
      role: new TakaroEventRoleMeta({ id: mockTakaroRole.id, name: mockTakaroRole.name }),
      type: 'role-assigned',
    });

    it('should trigger sync when role assigned in Takaro', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'true',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
          value: 'false',
          type: SettingsMode.Override,
          description: 'When true, Discord roles take precedence during conflicts',
          canHaveGameServerOverride: false,
        }),
      );

      // Mock the syncUserRoles call
      const syncStub = sandbox.stub(service, 'syncUserRoles').resolves({ rolesAdded: 1, rolesRemoved: 0 });

      await service.handleRoleAssignment('user-1', mockEvent);

      expect(syncStub).to.have.been.calledWith('user-1');
    });

    it('should skip when Discord is source of truth', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'true',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
          value: 'true',
          type: SettingsMode.Override,
          description: 'When true, Discord roles take precedence during conflicts',
          canHaveGameServerOverride: false,
        }),
      );

      const syncStub = sandbox.stub(service, 'syncUserRoles');

      await service.handleRoleAssignment('user-1', mockEvent);

      expect(syncStub).not.to.have.been.called;
    });

    it('should skip when sync is disabled', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'false',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );

      const syncStub = sandbox.stub(service, 'syncUserRoles');

      await service.handleRoleAssignment('user-1', mockEvent);

      expect(syncStub).not.to.have.been.called;
    });
  });

  describe('handleRoleRemoval', () => {
    const mockEvent = new TakaroEventRoleRemoved({
      role: new TakaroEventRoleMeta({ id: mockTakaroRole.id, name: mockTakaroRole.name }),
      type: 'role-removed',
    });

    it('should trigger sync when role removed in Takaro', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'true',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
          value: 'false',
          type: SettingsMode.Override,
          description: 'When true, Discord roles take precedence during conflicts',
          canHaveGameServerOverride: false,
        }),
      );

      const syncStub = sandbox.stub(service, 'syncUserRoles').resolves({ rolesAdded: 0, rolesRemoved: 1 });

      await service.handleRoleRemoval('user-1', mockEvent);

      expect(syncStub).to.have.been.calledWith('user-1');
    });

    it('should skip when Discord is source of truth', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'true',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
          value: 'true',
          type: SettingsMode.Override,
          description: 'When true, Discord roles take precedence during conflicts',
          canHaveGameServerOverride: false,
        }),
      );

      const syncStub = sandbox.stub(service, 'syncUserRoles');

      await service.handleRoleRemoval('user-1', mockEvent);

      expect(syncStub).not.to.have.been.called;
    });
  });

  describe('handleDiscordMemberUpdate', () => {
    it('should sync Discord role changes to Takaro', async () => {
      const oldRoles = new Map([['111111111111111111', {}]]);
      const newRoles = new Map([
        ['111111111111111111', {}],
        ['222222222222222222', {}],
      ]);

      const oldMember = {
        id: mockUser.discordId,
        guild: { id: guildId },
        roles: { cache: oldRoles },
      } as unknown as GuildMember;

      const newMember = {
        id: mockUser.discordId,
        guild: { id: guildId },
        roles: { cache: newRoles },
      } as unknown as GuildMember;

      // Mock finding user by Discord ID
      mockUserService.find.resolves({
        results: [mockUser as any],
        total: 1,
      });

      // Mock findOne for syncUserRoles
      const userWithRoles = Object.assign(new UserOutputWithRolesDTO(), mockUser.toJSON(), {
        roles: [
          new UserAssignmentOutputDTO({
            userId: mockUser.id,
            roleId: mockTakaroRole.id,
            role: mockTakaroRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        ],
      });
      mockUserService.findOne.resolves(userWithRoles);

      // Mock getMemberRoles for this test
      sandbox.stub(discordBot, 'getMemberRoles').resolves(['111111111111111111', '222222222222222222']);

      mockRoleService.find.resolves({
        results: [
          mockTakaroRole,
          new RoleOutputDTO({ ...mockTakaroRole.toJSON(), id: 'role-2', linkedDiscordRoleId: '222222222222222222' }),
        ],
        total: 2,
      });

      // Mock guild find
      sandbox.stub(service, 'find').resolves({
        results: [mockGuild],
        total: 1,
      });

      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'true',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncSourceOfTruth).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncSourceOfTruth,
          value: 'true',
          type: SettingsMode.Override,
          description: 'When true, Discord roles take precedence during conflicts',
          canHaveGameServerOverride: false,
        }),
      );

      await service.handleDiscordMemberUpdate(oldMember, newMember);

      // Should add role-2 to user in Takaro
      expect(mockUserService.assignRole).to.have.been.calledWith('role-2', mockUser.id);
    });

    it('should skip when sync is disabled', async () => {
      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'false',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );

      const member = {
        id: mockUser.discordId,
        guild: { id: guildId },
        roles: { cache: new Map() },
      } as unknown as GuildMember;
      await service.handleDiscordMemberUpdate(member, member);

      expect(mockUserService.find).not.to.have.been.called;
    });

    it('should skip when no role changes detected', async () => {
      const roles = new Map([['111111111111111111', {}]]);

      const oldMember = {
        id: mockUser.discordId,
        guild: { id: guildId },
        roles: { cache: roles },
      } as unknown as GuildMember;

      const newMember = {
        id: mockUser.discordId,
        guild: { id: guildId },
        roles: { cache: roles },
      } as unknown as GuildMember;

      mockSettingsService.get.withArgs(SETTINGS_KEYS.discordRoleSyncEnabled).resolves(
        new SettingsOutputDTO({
          key: SETTINGS_KEYS.discordRoleSyncEnabled,
          value: 'true',
          type: SettingsMode.Override,
          description: 'Enable or disable automatic role synchronization between Discord and Takaro',
          canHaveGameServerOverride: false,
        }),
      );

      await service.handleDiscordMemberUpdate(oldMember, newMember);

      expect(mockUserService.find).not.to.have.been.called;
    });
  });
});
