import { AnyJson } from '@takaro/shared';
import jwt from 'jsonwebtoken';

import { config } from '../config';

export interface IJWT {
  iat: number;
  [key: string]: AnyJson;
}

export async function verifyJwt(token: string): Promise<IJWT> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded as IJWT);
    });
  });
}
