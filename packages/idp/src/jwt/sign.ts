import { IJsonMap } from '@takaro/shared';
import jwt from 'jsonwebtoken';

import { config } from '../config';

export async function signJwt(payload: IJsonMap): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, config.jwt.secret, {}, (err, token) => {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });
}
