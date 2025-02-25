import { Request, Response, NextFunction } from 'express';

export function getAdminBasicAuth(secret: string) {
  return function adminBasicAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;

    // If no auth header is present, prompt for credentials
    if (!auth) {
      res.set('WWW-Authenticate', 'Basic realm="Admin Access"');
      res.status(401).send('Authentication required');
      return;
    }

    const [type, credentials] = auth.split(' ');

    // Verify auth type is Basic
    if (type !== 'Basic') {
      res.set('WWW-Authenticate', 'Basic realm="Admin Access"');
      res.status(401).send('Invalid authentication type');
      return;
    }

    // Decode and verify credentials
    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');

    if (username !== 'admin' || password !== secret) {
      res.set('WWW-Authenticate', 'Basic realm="Admin Access"');
      res.status(401).send('Invalid credentials');
      return;
    }

    next();
  };
}
