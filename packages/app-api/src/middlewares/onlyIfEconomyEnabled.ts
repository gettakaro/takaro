import { NextFunction, Response } from 'express';
import { errors } from '@takaro/util';
import { AuthenticatedRequest } from '../service/AuthService.js';
import { SETTINGS_KEYS, SettingsService } from '../service/SettingsService.js';
import { PlayerOnGameServerService } from '../service/PlayerOnGameserverService.js';

export async function onlyIfEconomyEnabledMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let gameServerId: string | null = null;
    // First, we need to try and find out if this route is gameserver-related

    // Could be a playerOnGameServer route
    const playerOnGameServerService = new PlayerOnGameServerService(req.domainId);
    const possiblePlayerId = req.params.id || req.params.sender || req.params.receiver;
    const maybePlayer = await playerOnGameServerService.findOne(possiblePlayerId);

    if (maybePlayer) {
      gameServerId = maybePlayer.gameServerId;
    }

    let settingsService: SettingsService | null = null;

    if (gameServerId) {
      settingsService = new SettingsService(req.domainId, gameServerId);
    } else {
      settingsService = new SettingsService(req.domainId);
    }

    const economyEnabled = await settingsService.get(SETTINGS_KEYS.economyEnabled);

    if (economyEnabled === 'false') {
      return next(new errors.BadRequestError('Economy is not enabled'));
    }

    next();
  } catch (error) {
    next(error);
  }
}
