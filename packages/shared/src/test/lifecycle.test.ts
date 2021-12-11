import { Connection } from 'typeorm';

import { getDatabase } from '../database';


let conn: Connection;

beforeEach(async () => {
  conn = await getDatabase();
});

afterEach(async () => {
  await conn.close();
});