import passport from 'passport';
import { Controller, Get, UseBefore } from 'routing-controllers';
import { errors } from '@takaro/util';
import { AuthService } from '../service/AuthService.js';

@UseBefore(AuthService.getAuthMiddleware([]))
@Controller()
export class ExternalAuthController {
  @Get('/auth/discord')
  @UseBefore(passport.authenticate('discord', { session: false }))
  authDiscord() {
    throw new errors.BadRequestError('Middleware should have handled this');
  }

  @Get('/auth/discord/return')
  @UseBefore(passport.authenticate('discord', { session: false }))
  authDiscordReturn() {
    throw new errors.BadRequestError('Middleware should have handled this');
  }
}
