import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health.js';
import { dashboardRouter } from './routes/dashboard.js';
import { smimeRouter } from './routes/smime.js';
import { openpgpRouter } from './routes/openpgp.js';
import { gatewayRouter } from './routes/gateway.js';
import { auditRouter } from './routes/audit.js';
import { credentialsRouter } from './routes/credentials.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (sanitized - never logs private keys or secrets)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
  next();
});

// Path normalization middleware: ensure routes prefixed with /api match seamlessly
// whether called directly or rewritten by Vercel serverless function
app.use((req: Request, _res: Response, next: NextFunction) => {
  // If req.url doesn't start with /api, prefix it internally so routers mounted on /api match
  if (!req.url.startsWith('/api') && !req.path.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Mounted Routes
app.use('/api', healthRouter);
app.use('/api', dashboardRouter);
app.use('/api/smime', smimeRouter);
app.use('/api/openpgp', openpgpRouter);
app.use('/api/gateway', gatewayRouter);
app.use('/api/demo', gatewayRouter);
app.use('/api', auditRouter);
app.use('/api', credentialsRouter);

// Catch-all 404 handler for API endpoints
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Gateway endpoint '${req.originalUrl || req.baseUrl}' not found. Please verify the URL and HTTP method.`,
    },
  });
});

// Centralized structured error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Gateway Error]', err);
  const status = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
  res.status(status).json({
    error: {
      code: err.code || 'CRYPTO_GATEWAY_ERROR',
      message: err.message || 'Internal Cryptographic Gateway Error',
    },
  });
});

export default app;
export { app };
