import { database } from '@takaro/shared';
import { Connection } from 'typeorm';

let conn: Connection;
beforeEach(async () => {
  conn = await database.getDatabase();
});

afterEach(async () => {
  await conn.close();
});
