import passport from 'passport';
import { Controller, Get, QueryParams, Req, Res, UseBefore } from 'routing-controllers';
import { errors } from '@takaro/util';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import { Response, NextFunction } from 'express';
import { Redis } from '@takaro/db';
import { IsString } from 'class-validator';

function getKey(key: string) {
  return `redirect-middle:${key}`;
}

/**
 * This middleware is used to redirect the user to the correct page after they have logged in via some external auth provider
 * @returns
 */
async function redirectMiddleware() {
  const redis = await Redis.getClient('redirectMiddle');

  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (req.query.redirect) {
      await redis.set(getKey(req.user.id), req.query.redirect as string, {
        EX: 60 * 5,
      });
    }

    next();
  };
}

class RedirectQs {
  @IsString()
  redirect?: string;
}

@UseBefore(AuthService.getAuthMiddleware([]))
@Controller()
export class ExternalAuthController {
  @Get('/auth/discord')
  @UseBefore(await redirectMiddleware(), passport.authenticate('discord', { session: false }))
  authDiscord(@QueryParams() _qs: RedirectQs) {
    throw new errors.BadRequestError('Middleware should have handled this');
  }

  @Get('/auth/discord/return')
  @UseBefore(passport.authenticate('discord', { session: false }))
  async authDiscordReturn(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const redis = await Redis.getClient('redirectMiddle');
    const redirectTo = await redis.get(getKey(req.user.id));
    if (redirectTo) {
      await redis.del(getKey(req.user.id));
      res.redirect(redirectTo);
    }

    return res;
  }
}
