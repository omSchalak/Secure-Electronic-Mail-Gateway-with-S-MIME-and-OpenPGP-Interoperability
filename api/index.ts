import type { Request, Response } from 'express';
import app from '../server/src/app.js';
import { initializeSampleCredentials } from '../server/src/data/sampleKeys.js';

let credentialsPromise: Promise<any> | null = null;

export default async function handler(req: Request, res: Response) {
  if (!credentialsPromise) {
    credentialsPromise = initializeSampleCredentials().catch((err) => {
      console.error('[Vercel Serverless] Failed to initialize sample credentials:', err);
      credentialsPromise = null;
    });
  }
  await credentialsPromise;
  return app(req, res);
}
