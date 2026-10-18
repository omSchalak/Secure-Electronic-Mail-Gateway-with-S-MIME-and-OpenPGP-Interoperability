import { Router, Request, Response } from 'express';
import { SmimeService } from '../crypto/smimeService.js';
import { initializeSampleCredentials } from '../data/sampleKeys.js';
import { addAuditLog } from '../data/auditStore.js';

export const smimeRouter = Router();

// Inspect X.509 Certificate
smimeRouter.post('/inspect-certificate', (req: Request, res: Response) => {
  try {
    const { certificatePem } = req.body;
    if (!certificatePem || typeof certificatePem !== 'string' || !certificatePem.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_CERTIFICATE',
          message: 'Missing or empty certificatePem in request body',
        },
      });
      return;
    }

    const inspection = SmimeService.inspectCertificate(certificatePem);
    if (!inspection.isValid) {
      res.status(422).json({
        error: {
          code: 'INVALID_CERTIFICATE',
          message: inspection.error || 'Invalid or malformed X.509 certificate PEM data',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: inspection,
    });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'CERT_INSPECTION_FAILED',
        message: err.message || 'Error processing certificate inspection',
      },
    });
  }
});

// S/MIME Sign
smimeRouter.post('/sign', async (req: Request, res: Response) => {
  try {
    const { content, privateKeyPem, certificatePem, useSampleKey } = req.body;
    const creds = await initializeSampleCredentials();

    let key = privateKeyPem;
    let cert = certificatePem;

    if (useSampleKey) {
      key = creds.smime.alice.privateKeyPem;
      cert = creds.smime.alice.certPem;
    } else if (!key || !cert) {
      res.status(400).json({
        error: {
          code: 'MISSING_SIGNING_CREDENTIALS',
          message: 'Both privateKeyPem and certificatePem are required for S/MIME signing (or specify useSampleKey: true)',
        },
      });
      return;
    }

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        error: {
          code: 'MISSING_CONTENT',
          message: 'Message content must be provided as a string',
        },
      });
      return;
    }

    const result = SmimeService.signMessage(content, key, cert);
    if (!result.success) {
      res.status(422).json({
        error: {
          code: 'SIGNING_FAILED',
          message: result.error || 'S/MIME signing failed',
        },
      });
      return;
    }

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'S/MIME',
      action: 'S/MIME Message Digital Signing',
      sender: result.signerCertSubject || 'Alice Smith (Sample)',
      recipient: 'Broadcast/Recipient',
      status: 'SUCCESS',
      verificationStatus: 'VERIFIED',
      details: 'Generated PKCS#7 SignedData structure using RSA-2048 and SHA-256 digest.',
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'SIGN_ERROR',
        message: err.message || 'S/MIME sign operation failed',
      },
    });
  }
});

// S/MIME Verify Signature
smimeRouter.post('/verify-signature', (req: Request, res: Response) => {
  try {
    const { signedPem, rawContent } = req.body;
    if (!signedPem || typeof signedPem !== 'string') {
      res.status(400).json({
        error: {
          code: 'MISSING_SIGNED_DATA',
          message: 'signedPem (PKCS#7 SignedData PEM) is required',
        },
      });
      return;
    }

    const result = SmimeService.verifySignature(signedPem, rawContent);

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'S/MIME',
      action: 'S/MIME Signature Verification',
      sender: result.signerCertSubject || 'Unknown Signer',
      recipient: 'Gateway Verifier',
      status: result.verified ? 'SUCCESS' : 'FAILED',
      verificationStatus: result.verified ? 'VERIFIED' : 'FAILED',
      details: result.verified
        ? `PKCS#7 signature mathematically verified. Signer subject: ${result.signerCertSubject}. ${result.trustNote}`
        : `Signature verification failed: ${result.error}`,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'VERIFY_ERROR',
        message: err.message || 'Signature verification failed',
      },
    });
  }
});

// S/MIME Encrypt
smimeRouter.post('/encrypt', async (req: Request, res: Response) => {
  try {
    const { content, recipientCertPem, useSampleCert } = req.body;
    const creds = await initializeSampleCredentials();

    let cert = recipientCertPem;
    if (useSampleCert) {
      cert = creds.smime.david.certPem;
    } else if (!cert || typeof cert !== 'string' || !cert.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_RECIPIENT_CERTIFICATE',
          message: 'A valid recipient X.509 certificate (recipientCertPem) is required for S/MIME encryption (or specify useSampleCert: true)',
        },
      });
      return;
    }

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        error: {
          code: 'MISSING_CONTENT',
          message: 'Message content is required for encryption',
        },
      });
      return;
    }

    const result = SmimeService.encryptMessage(content, cert);
    if (!result.success) {
      res.status(422).json({
        error: {
          code: 'ENCRYPTION_FAILED',
          message: result.error || 'S/MIME encryption failed',
        },
      });
      return;
    }

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'S/MIME',
      action: 'S/MIME PKCS#7 Encryption',
      sender: 'Sender Client',
      recipient: result.recipientSubject || 'David Vance (Sample)',
      status: 'SUCCESS',
      verificationStatus: 'NOT_APPLICABLE',
      details: 'Encapsulated plaintext into PKCS#7 EnvelopedData structure for recipient certificate.',
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'ENCRYPT_ERROR',
        message: err.message || 'S/MIME encryption failed',
      },
    });
  }
});

// S/MIME Decrypt
smimeRouter.post('/decrypt', async (req: Request, res: Response) => {
  try {
    const { encryptedPem, recipientPrivateKeyPem, useSampleKey } = req.body;
    const creds = await initializeSampleCredentials();

    let key = recipientPrivateKeyPem;
    let cert = creds.smime.david.certPem;
    if (useSampleKey) {
      key = creds.smime.david.privateKeyPem;
    } else if (!key || typeof key !== 'string' || !key.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_DECRYPTION_KEY',
          message: 'recipientPrivateKeyPem is required for S/MIME decryption (or specify useSampleKey: true)',
        },
      });
      return;
    }

    if (!encryptedPem || typeof encryptedPem !== 'string') {
      res.status(400).json({
        error: {
          code: 'MISSING_ENCRYPTED_DATA',
          message: 'encryptedPem is required for decryption',
        },
      });
      return;
    }

    const result = SmimeService.decryptMessage(encryptedPem, key, cert);
    if (!result.success) {
      res.status(422).json({
        error: {
          code: 'DECRYPTION_FAILED',
          message: result.error || 'S/MIME decryption failed',
        },
      });
      return;
    }

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'S/MIME',
      action: 'S/MIME PKCS#7 Decryption',
      sender: 'Encrypted Message Ingestion',
      recipient: 'Authorized Recipient',
      status: 'SUCCESS',
      verificationStatus: 'NOT_APPLICABLE',
      details: 'Successfully decrypted PKCS#7 EnvelopedData using recipient private key.',
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'DECRYPT_ERROR',
        message: err.message || 'S/MIME decryption failed',
      },
    });
  }
});

// S/MIME Sample Certificates
smimeRouter.get('/sample-credentials', async (_req: Request, res: Response) => {
  try {
    const creds = await initializeSampleCredentials();
    res.json({
      alice: {
        subject: creds.smime.alice.subject,
        email: creds.smime.alice.email,
        certPem: creds.smime.alice.certPem,
        privateKeyPem: creds.smime.alice.privateKeyPem,
      },
      david: {
        subject: creds.smime.david.subject,
        email: creds.smime.david.email,
        certPem: creds.smime.david.certPem,
        privateKeyPem: creds.smime.david.privateKeyPem,
      },
      gateway: {
        subject: creds.smime.gateway.subject,
        email: creds.smime.gateway.email,
        certPem: creds.smime.gateway.certPem,
        privateKeyPem: creds.smime.gateway.privateKeyPem,
      },
      expired: {
        subject: creds.smime.expired.subject,
        email: creds.smime.expired.email,
        certPem: creds.smime.expired.certPem,
        privateKeyPem: creds.smime.expired.privateKeyPem,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'CREDENTIALS_FAILED',
        message: err.message || 'Failed to load sample S/MIME credentials',
      },
    });
  }
});
