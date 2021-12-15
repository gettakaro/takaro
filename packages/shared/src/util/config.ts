import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const myEnv = dotenvExpand(dotenv.config({ path: '../../.env' })).parsed;

export interface Config {
  http: {
    port: number;
  };
  database: {
    url: string;
    entitiesPath: string[];
  };
  cache: {
    url: string;
  };
  logging: {
    level: string;
    json: boolean;
  };
  jwtSecret: string;
}

const isDevMode = myEnv.NODE_ENV !== 'production';

const config: Config = {
  http: {
    port: +(myEnv.PORT || 3000),
  },
  database: {
    url: myEnv.DATABASE_URL || 'postgres://user:pass@localhost:5432/apidb',
    entitiesPath: [
      ...(isDevMode
        ? ['src/database/entity/**/!(*.test.ts)']
        : ['dist/database/entity/**/*.!(*.test.js)']),
    ],
  },
  cache: {
    url: myEnv.CACHE_URL || 'redis://localhost:6379',
  },
  logging: {
    level: isDevMode ? 'debug' : 'info',
    json: !isDevMode,
  },
  jwtSecret: myEnv.JWT_SECRET || 'your-secret-whatever',
};

export { config };
