import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export interface Config {
  http: {
    port: number;
  };
  database: {
    ssl: boolean;
    url: string;
    entitiesPath: string[];
  };
  logging: {
    level: string;
    json: boolean;
  };
  jwtSecret: string;
}

const isDevMode = process.env.NODE_ENV !== 'production';

const config: Config = {
  http: {
    port: +(process.env.PORT || 3000),
  },
  database: {
    ssl: !isDevMode,
    url:
      process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/apidb',
    entitiesPath: [
      ...(isDevMode
        ? ['src/database/entity/**/!(*.test.ts)']
        : ['dist/database/entity/**/*.!(*.test.js)']),
    ],
  },
  logging: {
    level: isDevMode ? 'debug' : 'info',
    json: isDevMode,
  },
  jwtSecret: process.env.JWT_SECRET || 'your-secret-whatever',
};

export { config };
