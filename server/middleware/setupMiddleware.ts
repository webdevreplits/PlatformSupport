import { Request, Response, NextFunction } from 'express';
import { configService } from '../config/ConfigService';
import { isDatabaseConfigured } from '../db';

// Paths that are always accessible (even before setup or when locked)
const PUBLIC_PATHS = [
  '/api/bootstrap/status',
  '/api/bootstrap/initialize',
  '/api/bootstrap/validate-database',
  '/api/bootstrap/unlock',
  '/health',
  '/api/health'
];

export function setupMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if this is a public path
  const isPublicPath = PUBLIC_PATHS.some(path => req.path.startsWith(path));
  
  if (isPublicPath) {
    return next();
  }

  // Check if this is a static file request
  if (req.path.startsWith('/assets/') || req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.html')) {
    return next();
  }

  // Check if app is locked (setup complete but encrypted secrets can't be decrypted)
  if (configService.isLocked()) {
    return res.status(503).json({
      error: 'AppLocked',
      message: 'Application is locked. Please provide the encryption passphrase.',
      locked: true
    });
  }

  // Check if setup is completed
  if (!configService.isSetupCompleted() || !isDatabaseConfigured()) {
    return res.status(503).json({
      error: 'SetupRequired',
      message: 'Application setup is not complete. Please complete the setup wizard.',
      setupRequired: true
    });
  }

  next();
}
