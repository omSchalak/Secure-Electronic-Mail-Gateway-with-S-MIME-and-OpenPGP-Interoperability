import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Secure Electronic Mail Gateway API',
    creator: 'Mansi Chalak',
    domain: 'Network Security and Secure Communication Protocols',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    capabilities: {
      smime: 'X.509 Certificate Inspection, PKCS#7 / CMS Signing, Verification, EnvelopedData Encryption',
      openpgp: 'OpenPGP.js ECC/RSA KeyGen, Armor Parsing, Encryption, Decryption, Cleartext/Detached Signatures',
      interoperability: 'Controlled Decrypt-and-Re-encrypt Gateway Engine (6 Scenarios)',
      audit: 'Tamper-evident audit logging with CSV/JSON export',
    },
  });
});
