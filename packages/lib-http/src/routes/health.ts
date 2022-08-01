import { RequestHandler } from 'express';

export const healthHandler: RequestHandler = (req, res) => {
  res.send('OK');
};
