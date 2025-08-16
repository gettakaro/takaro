import { expect, sandbox } from '@takaro/test';
import { describe, it, beforeEach, afterEach } from 'node:test';
import * as sinon from 'sinon';
import {
  validateSteamId,
  linkSteamPlayerOnWebLogin,
  linkSteamPlayerOnGameJoin,
  createUserForSteamIdentity,
} from '../steamAutoLinking.js';
import { ory } from '@takaro/auth';
import { PlayerRepo } from '../../db/player.js';
import { UserRepo } from '../../db/user.js';
import { UserService } from '../../service/User/index.js';
import { EventService } from '../../service/EventService.js';

// Test fixtures
const VALID_STEAM_ID = '76561198012345678';
const INVALID_STEAM_ID = '123456'; // Too short
const TEST_DOMAIN_ID = 'test-domain-123';
const TEST_IDENTITY_ID = 'identity-456';
const TEST_PLAYER_ID = 'player-789';
const TEST_USER_ID = 'user-abc';

const mockIdentity = {
  id: TEST_IDENTITY_ID,
  email: 'test@example.com',
  steamId: VALID_STEAM_ID,
  discordId: 'discord123',
  name: 'TestUser',
  stripeId: undefined,
};

const mockIdentityWithoutSteam = {
  id: TEST_IDENTITY_ID,
  email: 'test@example.com',
  steamId: undefined,
  discordId: 'discord123',
  name: 'TestUser',
  stripeId: undefined,
};

const mockPlayer = {
  id: TEST_PLAYER_ID,
  name: 'TestPlayer',
  steamId: VALID_STEAM_ID,
  domainId: TEST_DOMAIN_ID,
};

const mockUser = {
  id: TEST_USER_ID,
  name: 'TestUser',
  email: 'test@example.com',
  idpId: TEST_IDENTITY_ID,
  steamId: VALID_STEAM_ID,
  discordId: 'discord123',
  playerId: null,
  domain: TEST_DOMAIN_ID,
  isDashboardUser: false,
  lastSeen: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('steamAutoLinking', () => {
  beforeEach(() => {
    // Mock the logger function itself
    sandbox.stub(console, 'log');
    sandbox.stub(console, 'warn');
    sandbox.stub(console, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('validateSteamId', () => {
    it('should return true for valid 17-digit Steam ID', () => {
      expect(validateSteamId(VALID_STEAM_ID)).to.be.true;
      expect(validateSteamId('12345678901234567')).to.be.true;
    });

    it('should return false for invalid Steam IDs', () => {
      expect(validateSteamId('123456')).to.be.false; // Too short
      expect(validateSteamId('123456789012345678')).to.be.false; // Too long
      expect(validateSteamId('1234567890123456a')).to.be.false; // Contains letter
      expect(validateSteamId('')).to.be.false; // Empty string
      expect(validateSteamId('steam_12345678901234567')).to.be.false; // Has prefix
    });

    it('should handle edge cases', () => {
      expect(validateSteamId(null as any)).to.be.false;
      expect(validateSteamId(undefined as any)).to.be.false;
      // eslint-disable-next-line no-loss-of-precision
      expect(validateSteamId(12345678901234567 as any)).to.be.true; // Number gets converted to string and is valid
      expect(validateSteamId(123 as any)).to.be.false; // Short number is still invalid
    });
  });

  describe('linkSteamPlayerOnWebLogin', () => {
    let oryStub: sinon.SinonStub;
    let playerRepoStub: sinon.SinonStub;
    let userRepoFindStub: sinon.SinonStub;
    let userRepoLinkPlayerStub: sinon.SinonStub;
    let userServiceCreateInternalStub: sinon.SinonStub;
    let eventServiceCreateStub: sinon.SinonStub;

    beforeEach(() => {
      oryStub = sandbox.stub(ory, 'getIdentity');
      playerRepoStub = sandbox.stub(PlayerRepo, 'NOT_DOMAIN_SCOPED_findBySteamIdAcrossDomains');

      // Mock UserRepo methods
      userRepoFindStub = sandbox.stub(UserRepo.prototype, 'find');
      userRepoLinkPlayerStub = sandbox.stub(UserRepo.prototype, 'linkPlayer');

      // Mock UserService
      userServiceCreateInternalStub = sandbox.stub(UserService.prototype, 'createInternal');

      // Mock EventService
      eventServiceCreateStub = sandbox.stub(EventService.prototype, 'create');
    });

    it('should successfully link multiple players across domains', async () => {
      const secondPlayer = { ...mockPlayer, id: 'player-xyz', domainId: 'domain-2' };

      oryStub.resolves(mockIdentity);
      playerRepoStub.resolves([mockPlayer, secondPlayer]);
      userRepoFindStub.resolves({ results: [] }); // No existing links
      userServiceCreateInternalStub.resolves(mockUser);
      userRepoLinkPlayerStub.resolves();
      eventServiceCreateStub.resolves();

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(2);
      expect(results[0]).to.deep.include({
        success: true,
        playerId: mockPlayer.id,
        domainId: mockPlayer.domainId,
      });
      expect(results[1]).to.deep.include({
        success: true,
        playerId: secondPlayer.id,
        domainId: secondPlayer.domainId,
      });

      expect(userServiceCreateInternalStub.calledTwice).to.be.true;
      expect(userRepoLinkPlayerStub.calledTwice).to.be.true;
      expect(eventServiceCreateStub.calledTwice).to.be.true;
    });

    it('should return error when identity has no Steam ID', async () => {
      oryStub.resolves(mockIdentityWithoutSteam);

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(1);
      expect(results[0]).to.deep.include({
        success: false,
        error: 'Identity does not have Steam ID',
      });

      expect(playerRepoStub.called).to.be.false;
    });

    it('should return error for invalid Steam ID format', async () => {
      oryStub.resolves({ ...mockIdentity, steamId: INVALID_STEAM_ID });

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(1);
      expect(results[0]).to.deep.include({
        success: false,
        error: 'Invalid Steam ID format',
      });

      expect(playerRepoStub.called).to.be.false;
    });

    it('should return empty array when no players found', async () => {
      oryStub.resolves(mockIdentity);
      playerRepoStub.resolves([]);

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(0);
      expect(userRepoFindStub.called).to.be.false;
    });

    it('should skip players already linked to another user', async () => {
      oryStub.resolves(mockIdentity);
      playerRepoStub.resolves([mockPlayer]);
      userRepoFindStub.onFirstCall().resolves({
        results: [{ id: 'existing-user-id', playerId: mockPlayer.id }],
      });

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(1);
      expect(results[0]).to.deep.include({
        success: false,
        playerId: mockPlayer.id,
        error: 'Player already linked to another user',
      });

      expect(userServiceCreateInternalStub.called).to.be.false;
      expect(userRepoLinkPlayerStub.called).to.be.false;
    });

    it('should use existing user when already exists in domain', async () => {
      oryStub.resolves(mockIdentity);
      playerRepoStub.resolves([mockPlayer]);
      userRepoFindStub
        .onFirstCall()
        .resolves({ results: [] }) // No player link
        .onSecondCall()
        .resolves({ results: [mockUser] }); // User exists
      userRepoLinkPlayerStub.resolves();
      eventServiceCreateStub.resolves();

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(1);
      expect(results[0]).to.deep.include({
        success: true,
        playerId: mockPlayer.id,
        domainId: mockPlayer.domainId,
      });

      expect(userServiceCreateInternalStub.called).to.be.false; // Should not create new user
      expect(userRepoLinkPlayerStub.calledOnce).to.be.true;
    });

    it('should handle partial failures gracefully', async () => {
      const secondPlayer = { ...mockPlayer, id: 'player-xyz', domainId: 'domain-2' };

      oryStub.resolves(mockIdentity);
      playerRepoStub.resolves([mockPlayer, secondPlayer]);

      // First player succeeds
      userRepoFindStub.onCall(0).resolves({ results: [] }).onCall(1).resolves({ results: [] });
      userServiceCreateInternalStub.onFirstCall().resolves(mockUser);
      userRepoLinkPlayerStub.onFirstCall().resolves();
      eventServiceCreateStub.onFirstCall().resolves();

      // Second player fails
      userRepoFindStub.onCall(2).resolves({ results: [] }).onCall(3).resolves({ results: [] });
      userServiceCreateInternalStub.onSecondCall().rejects(new Error('Database error'));

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(2);
      expect(results[0]).to.deep.include({
        success: true,
        playerId: mockPlayer.id,
      });
      expect(results[1]).to.deep.include({
        success: false,
        playerId: secondPlayer.id,
        error: 'Database error',
      });
    });

    it('should handle Ory identity fetch failure', async () => {
      oryStub.rejects(new Error('Ory service unavailable'));

      const results = await linkSteamPlayerOnWebLogin(TEST_IDENTITY_ID);

      expect(results).to.have.length(1);
      expect(results[0]).to.deep.include({
        success: false,
        error: 'Ory service unavailable',
      });
    });
  });

  describe('linkSteamPlayerOnGameJoin', () => {
    let userRepoFindStub: sinon.SinonStub;
    let userRepoLinkPlayerStub: sinon.SinonStub;
    let userServiceFindOneStub: sinon.SinonStub;
    let userServiceCreateInternalStub: sinon.SinonStub;
    let oryGetIdentityBySteamIdStub: sinon.SinonStub;
    let eventServiceCreateStub: sinon.SinonStub;

    beforeEach(() => {
      // Mock UserRepo
      userRepoFindStub = sandbox.stub(UserRepo.prototype, 'find');
      userRepoLinkPlayerStub = sandbox.stub(UserRepo.prototype, 'linkPlayer');

      // Mock UserService
      userServiceFindOneStub = sandbox.stub(UserService.prototype, 'findOne');
      userServiceCreateInternalStub = sandbox.stub(UserService.prototype, 'createInternal');

      // Mock Ory
      oryGetIdentityBySteamIdStub = sandbox.stub(ory, 'getIdentityBySteamId');

      // Mock EventService
      eventServiceCreateStub = sandbox.stub(EventService.prototype, 'create');
    });

    it('should successfully link player to existing user with Steam ID', async () => {
      userRepoFindStub
        .onFirstCall()
        .resolves({ results: [] }) // No existing link
        .onSecondCall()
        .resolves({ results: [mockUser, { ...mockUser, id: 'user-2' }] }) // All users
        .onThirdCall()
        .resolves({ results: [mockUser] }); // User for linking check

      userServiceFindOneStub.onFirstCall().resolves({ ...mockUser, steamId: 'wrong-id' });
      userServiceFindOneStub.onSecondCall().resolves(mockUser); // Matching Steam ID

      userRepoLinkPlayerStub.resolves();
      eventServiceCreateStub.resolves();

      const result = await linkSteamPlayerOnGameJoin(TEST_PLAYER_ID, VALID_STEAM_ID, TEST_DOMAIN_ID);

      expect(result).to.deep.include({
        success: true,
        playerId: TEST_PLAYER_ID,
        domainId: TEST_DOMAIN_ID,
      });

      expect(userRepoLinkPlayerStub.calledOnce).to.be.true;
      expect(eventServiceCreateStub.calledOnce).to.be.true;
    });

    it('should return error for invalid Steam ID', async () => {
      const result = await linkSteamPlayerOnGameJoin(TEST_PLAYER_ID, INVALID_STEAM_ID, TEST_DOMAIN_ID);

      expect(result).to.deep.include({
        success: false,
        playerId: TEST_PLAYER_ID,
        domainId: TEST_DOMAIN_ID,
        error: 'Invalid Steam ID format',
      });

      expect(userRepoFindStub.called).to.be.false;
    });

    it('should return error when player already has a user', async () => {
      userRepoFindStub.onFirstCall().resolves({
        results: [{ ...mockUser, playerId: TEST_PLAYER_ID }],
      });

      const result = await linkSteamPlayerOnGameJoin(TEST_PLAYER_ID, VALID_STEAM_ID, TEST_DOMAIN_ID);

      expect(result).to.deep.include({
        success: false,
        playerId: TEST_PLAYER_ID,
        domainId: TEST_DOMAIN_ID,
        error: 'Player already linked to a user',
      });

      expect(userServiceFindOneStub.called).to.be.false;
    });

    it('should create user when Ory identity exists but no Takaro user', async () => {
      userRepoFindStub
        .onFirstCall()
        .resolves({ results: [] }) // No existing link
        .onSecondCall()
        .resolves({ results: [] }) // No users in domain
        .onThirdCall()
        .resolves({ results: [mockUser] }); // After creation

      oryGetIdentityBySteamIdStub.resolves(mockIdentity);

      // Use the already stubbed createInternal
      userServiceCreateInternalStub.resolves(mockUser);

      userRepoLinkPlayerStub.resolves();
      eventServiceCreateStub.resolves();

      const result = await linkSteamPlayerOnGameJoin(TEST_PLAYER_ID, VALID_STEAM_ID, TEST_DOMAIN_ID);

      expect(result).to.deep.include({
        success: true,
        playerId: TEST_PLAYER_ID,
        domainId: TEST_DOMAIN_ID,
      });

      expect(oryGetIdentityBySteamIdStub.calledOnce).to.be.true;
      expect(userServiceCreateInternalStub.calledOnce).to.be.true;
    });

    it('should return error when no Ory identity found', async () => {
      userRepoFindStub
        .onFirstCall()
        .resolves({ results: [] }) // No existing link
        .onSecondCall()
        .resolves({ results: [] }); // No users

      oryGetIdentityBySteamIdStub.resolves(null);

      const result = await linkSteamPlayerOnGameJoin(TEST_PLAYER_ID, VALID_STEAM_ID, TEST_DOMAIN_ID);

      expect(result).to.deep.include({
        success: false,
        playerId: TEST_PLAYER_ID,
        domainId: TEST_DOMAIN_ID,
        error: 'No Ory identity found with this Steam ID',
      });

      expect(userRepoLinkPlayerStub.called).to.be.false;
    });

    it('should return error when user already linked to different player', async () => {
      userRepoFindStub
        .onFirstCall()
        .resolves({ results: [] }) // No existing link for this player
        .onSecondCall()
        .resolves({ results: [mockUser] }) // All users
        .onThirdCall()
        .resolves({
          results: [{ ...mockUser, playerId: 'different-player-id' }],
        });

      userServiceFindOneStub.resolves(mockUser);

      const result = await linkSteamPlayerOnGameJoin(TEST_PLAYER_ID, VALID_STEAM_ID, TEST_DOMAIN_ID);

      expect(result).to.deep.include({
        success: false,
        playerId: TEST_PLAYER_ID,
        domainId: TEST_DOMAIN_ID,
        error: 'User already linked to different player in this domain',
      });

      expect(userRepoLinkPlayerStub.called).to.be.false;
    });

    it('should handle database errors gracefully', async () => {
      userRepoFindStub.onFirstCall().rejects(new Error('Database connection lost'));

      const result = await linkSteamPlayerOnGameJoin(TEST_PLAYER_ID, VALID_STEAM_ID, TEST_DOMAIN_ID);

      expect(result).to.deep.include({
        success: false,
        playerId: TEST_PLAYER_ID,
        domainId: TEST_DOMAIN_ID,
        error: 'Database connection lost',
      });
    });
  });

  describe('createUserForSteamIdentity', () => {
    let userServiceCreateInternalStub: sinon.SinonStub;

    beforeEach(() => {
      userServiceCreateInternalStub = sandbox.stub(UserService.prototype, 'createInternal');
    });

    it('should create user with full identity data', async () => {
      userServiceCreateInternalStub.resolves(mockUser);

      const result = await createUserForSteamIdentity(mockIdentity, TEST_DOMAIN_ID);

      expect(result).to.deep.equal(mockUser);

      const callArg = userServiceCreateInternalStub.firstCall.args[0];
      expect(callArg.idpId).to.equal(mockIdentity.id);
      expect(callArg.name).to.equal(mockIdentity.name);
      expect(callArg.email).to.equal(mockIdentity.email);
      expect(callArg.steamId).to.equal(mockIdentity.steamId);
      expect(callArg.discordId).to.equal(mockIdentity.discordId);
      expect(callArg.isDashboardUser).to.be.false;
    });

    it('should create user with minimal data (no email)', async () => {
      const minimalIdentity: any = {
        ...mockIdentity,
        email: undefined,
        name: undefined,
      };

      userServiceCreateInternalStub.resolves({ ...mockUser, email: undefined });

      await createUserForSteamIdentity(minimalIdentity, TEST_DOMAIN_ID);

      const callArg = userServiceCreateInternalStub.firstCall.args[0];
      expect(callArg.name).to.equal(`steam_${minimalIdentity.steamId}`);
      expect(callArg.email).to.be.undefined;
    });

    it('should use name fallback when identity has no name', async () => {
      const identityWithoutName = {
        ...mockIdentity,
        name: undefined,
      };

      userServiceCreateInternalStub.resolves(mockUser);

      await createUserForSteamIdentity(identityWithoutName, TEST_DOMAIN_ID);

      const callArg = userServiceCreateInternalStub.firstCall.args[0];
      expect(callArg.name).to.equal(`steam_${identityWithoutName.steamId}`);
    });

    it('should throw error when user creation fails', async () => {
      const error = new Error('Unique constraint violation');
      userServiceCreateInternalStub.rejects(error);

      try {
        await createUserForSteamIdentity(mockIdentity, TEST_DOMAIN_ID);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.message).to.equal('Unique constraint violation');
      }
    });

    it('should create user successfully and return result', async () => {
      userServiceCreateInternalStub.resolves(mockUser);

      const result = await createUserForSteamIdentity(mockIdentity, TEST_DOMAIN_ID);

      expect(result).to.deep.equal(mockUser);
      expect(userServiceCreateInternalStub.calledOnce).to.be.true;
    });
  });
});
