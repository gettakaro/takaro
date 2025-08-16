import { UserService } from '../service/User/index.js';
import { EventService, EventCreateDTO } from '../service/EventService.js';
import { HookEvents, TakaroEventPlayerLinked } from '@takaro/modules';
import { logger } from '@takaro/util';
import { PlayerRepo } from '../db/player.js';
import { UserRepo } from '../db/user.js';
import { ory } from '@takaro/auth';
import type { ITakaroIdentity } from '@takaro/auth';
import { UserCreateInternalDTO } from '../service/User/dto.js';
import { UserOutputDTO } from '../service/User/dto.js';

// Simple Steam ID validation - 17 digit number
const STEAM_ID_REGEX = /^\d{17}$/;

interface LinkingResult {
  success: boolean;
  playerId?: string;
  domainId?: string;
  error?: string;
}

/**
 * Validates a Steam ID using simple regex check
 */
export function validateSteamId(steamId: string): boolean {
  return STEAM_ID_REGEX.test(steamId);
}

/**
 * Links all players with matching Steam ID to a user when they login via Steam on web
 * This handles cross-domain linking automatically
 */
export async function linkSteamPlayerOnWebLogin(identityId: string): Promise<LinkingResult[]> {
  const log = logger('steamAutoLinking');
  log.info('Starting Steam auto-linking on web login', { identityId });

  try {
    // Get the identity to extract Steam ID
    const identity = await ory.getIdentity(identityId);
    if (!identity.steamId) {
      log.warn('Identity does not have Steam ID', { identityId });
      return [
        {
          success: false,
          error: 'Identity does not have Steam ID',
        },
      ];
    }

    const steamId = identity.steamId;
    if (!validateSteamId(steamId)) {
      log.warn('Invalid Steam ID format', { steamId });
      return [
        {
          success: false,
          error: 'Invalid Steam ID format',
        },
      ];
    }

    // Find all players with this Steam ID across all domains
    const players = await PlayerRepo.NOT_DOMAIN_SCOPED_findBySteamIdAcrossDomains(steamId);

    if (players.length === 0) {
      log.info('No players found with Steam ID', { steamId });
      return [];
    }

    log.info('Found players to link', { count: players.length, steamId });

    // Use Promise.allSettled to handle partial failures
    const linkingPromises = players.map(async (player) => {
      try {
        const userRepo = new UserRepo(player.domainId);

        // Check if player already has a user linked
        const existingUsersForPlayer = await userRepo.find({
          filters: { playerId: [player.id] },
        });

        if (existingUsersForPlayer.results.length > 0) {
          log.info('Player already linked to a user', {
            playerId: player.id,
            existingUserId: existingUsersForPlayer.results[0].id,
            domainId: player.domainId,
          });
          return {
            success: false,
            playerId: player.id,
            domainId: player.domainId,
            error: 'Player already linked to another user',
          };
        }

        // Check if user already exists for this identity in this domain
        const existingUsersForIdentity = await userRepo.find({
          filters: { idpId: [identityId] },
        });

        let userId: string;

        if (existingUsersForIdentity.results.length > 0) {
          // User already exists for this identity in this domain
          userId = existingUsersForIdentity.results[0].id;
          log.info('Found existing user for identity in domain', {
            userId,
            identityId,
            domainId: player.domainId,
          });
        } else {
          // Create new user for this identity in this domain
          const userService = new UserService(player.domainId);
          const userData = new UserCreateInternalDTO();
          userData.idpId = identityId;
          userData.name = identity.name || identity.email || `steam_${steamId}`;
          userData.email = identity.email;
          userData.isDashboardUser = false;
          userData.discordId = identity.discordId;
          userData.steamId = identity.steamId;

          const createdUser = await userService.createInternal(userData);
          userId = createdUser.id;

          log.info('Created new user for identity in domain', {
            userId,
            identityId,
            domainId: player.domainId,
          });
        }

        // Link the player to the user
        await userRepo.linkPlayer(userId, player.id);

        // Emit PLAYER_LINKED event
        const eventService = new EventService(player.domainId);
        await eventService.create(
          new EventCreateDTO({
            eventName: HookEvents.PLAYER_LINKED,
            playerId: player.id,
            userId: userId,
            meta: new TakaroEventPlayerLinked(),
          }),
        );

        log.info('Successfully linked player to user', {
          playerId: player.id,
          userId,
          domainId: player.domainId,
        });

        return {
          success: true,
          playerId: player.id,
          domainId: player.domainId,
        };
      } catch (error) {
        log.error('Failed to link player', {
          playerId: player.id,
          domainId: player.domainId,
          error,
        });

        return {
          success: false,
          playerId: player.id,
          domainId: player.domainId,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.allSettled(linkingPromises);

    // Extract values from settled promises
    return results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            success: false,
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          },
    );
  } catch (error) {
    log.error('Failed to perform auto-linking on web login', { error });
    return [
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    ];
  }
}

/**
 * Links a player to an existing user when they join a game server
 * This is called when a player with Steam ID joins and has no user linked yet
 */
export async function linkSteamPlayerOnGameJoin(
  playerId: string,
  steamId: string,
  domainId: string,
): Promise<LinkingResult> {
  const log = logger('steamAutoLinking');
  log.info('Starting Steam auto-linking on game join', { playerId, steamId, domainId });

  if (!validateSteamId(steamId)) {
    log.warn('Invalid Steam ID format', { steamId });
    return {
      success: false,
      playerId,
      domainId,
      error: 'Invalid Steam ID format',
    };
  }

  try {
    // Check if player already has a user
    const userRepo = new UserRepo(domainId);
    const existingUsers = await userRepo.find({
      filters: { playerId: [playerId] },
    });

    if (existingUsers.results.length > 0) {
      log.info('Player already has a user', {
        playerId,
        userId: existingUsers.results[0].id,
      });
      return {
        success: false,
        playerId,
        domainId,
        error: 'Player already linked to a user',
      };
    }

    // Find all users in this domain and check their Steam IDs from Ory
    const allUsers = await userRepo.find({});
    let userWithSteamId = null;

    // Check each user's Ory identity for Steam ID
    const userService = new UserService(domainId);
    for (const user of allUsers.results) {
      try {
        const userWithAuth = await userService.findOne(user.id);
        if (userWithAuth && userWithAuth.steamId === steamId) {
          userWithSteamId = user;
          break;
        }
      } catch (error) {
        log.warn('Failed to get user auth data', { userId: user.id, error });
      }
    }

    if (!userWithSteamId) {
      // Check if there's an Ory identity with this Steam ID
      const identityWithSteamId = await ory.getIdentityBySteamId(steamId);

      if (identityWithSteamId) {
        // Create Takaro user for this identity in this domain
        log.info('Found Ory identity with Steam ID, creating user', {
          steamId,
          identityId: identityWithSteamId.id,
          domainId,
        });

        userWithSteamId = await createUserForSteamIdentity(identityWithSteamId, domainId);
      } else {
        // No identity exists
        log.info('No Ory identity found, nothing to do', { steamId, domainId });
        return {
          success: false,
          playerId,
          domainId,
          error: 'No Ory identity found with this Steam ID',
        };
      }
    }

    const user = userWithSteamId;

    // Check if user already has a different player linked in this domain
    const existingPlayers = await userRepo.find({
      filters: { id: [user.id] },
    });

    if (existingPlayers.results[0].playerId && existingPlayers.results[0].playerId !== playerId) {
      log.warn('User already linked to different player in domain', {
        userId: user.id,
        existingPlayerId: existingPlayers.results[0].playerId,
        newPlayerId: playerId,
      });
      return {
        success: false,
        playerId,
        domainId,
        error: 'User already linked to different player in this domain',
      };
    }

    // Link the player to the user
    await userRepo.linkPlayer(user.id, playerId);

    // Emit PLAYER_LINKED event
    const eventService = new EventService(domainId);
    await eventService.create(
      new EventCreateDTO({
        eventName: HookEvents.PLAYER_LINKED,
        playerId: playerId,
        userId: user.id,
        meta: new TakaroEventPlayerLinked(),
      }),
    );

    log.info('Successfully linked player to user on game join', {
      playerId,
      userId: user.id,
      domainId,
    });

    return {
      success: true,
      playerId,
      domainId,
    };
  } catch (error) {
    log.error('Failed to perform auto-linking on game join', { error, playerId, domainId });
    return {
      success: false,
      playerId,
      domainId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Creates a Takaro user for a Steam-registered Ory identity
 * This is called when a Steam player joins a game server and has an Ory identity but no Takaro user
 */
export async function createUserForSteamIdentity(identity: ITakaroIdentity, domainId: string): Promise<UserOutputDTO> {
  const log = logger('steamAutoLinking');
  log.info('Creating Takaro user for Steam identity', {
    identityId: identity.id,
    steamId: identity.steamId,
    domainId,
  });

  const userService = new UserService(domainId);

  // Create user with minimal data
  // Use name from identity if available, otherwise fallback to steam_steamId
  const displayName = identity.name || `steam_${identity.steamId}`;

  const userData = new UserCreateInternalDTO();
  userData.idpId = identity.id;
  userData.name = displayName;
  userData.email = identity.email;
  userData.isDashboardUser = false;
  userData.discordId = identity.discordId;
  userData.steamId = identity.steamId;

  try {
    const createdUser = await userService.createInternal(userData);

    log.info('Successfully created Takaro user for Steam identity', {
      userId: createdUser.id,
      identityId: identity.id,
      steamId: identity.steamId,
      domainId,
    });

    return createdUser;
  } catch (error) {
    log.error('Failed to create Takaro user for Steam identity', {
      identityId: identity.id,
      steamId: identity.steamId,
      domainId,
      error,
    });
    throw error;
  }
}
