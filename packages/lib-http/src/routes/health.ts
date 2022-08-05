import { RequestHandler } from 'express';
import { Route } from './Route';

const healthHandler: RequestHandler = (req, res) => {
  res.send('OK');
};

export const getHealth = new Route({
  handler: healthHandler,
  method: 'get',
  path: '/health',
});
