import { Router, Request, Response } from 'express';
import { OpenPGPService } from '../crypto/openpgpService.js';
import { initializeSampleCredentials } from '../data/sampleKeys.js';
import { addAuditLog } from '../data/auditStore.js';

export const openpgpRouter = Router();

// Generate key pair
openpgpRouter.post('/generate-key', async (req: Request, res: Response) => {
  try {
    const { name, email, passphrase, type } = req.body;
    if (!name || typeof name !== 'string' || !name.trim() || !email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_USER_IDENTITY',
          message: 'Valid name and email are required to generate an OpenPGP key pair',
        },
      });
      return;
    }

    const keyData = await OpenPGPService.generateKeyPair(name.trim(), email.trim(), passphrase, type || 'ecc');

    addAuditLog({
      category: 'KEY_MANAGEMENT',
      protocol: 'OpenPGP',
      action: 'OpenPGP Key Pair Generation',
      sender: `${name} <${email}>`,
      recipient: 'Local Keystore',
      status: 'SUCCESS',
      verificationStatus: 'VERIFIED',
      details: `Generated new ${keyData.algorithm} key pair with fingerprint ${keyData.fingerprint.slice(0, 16)}...`,
    });

    res.json({
      success: true,
      data: keyData,
    });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'KEYGEN_FAILED',
        message: err.message || 'Failed to generate OpenPGP key',
      },
    });
  }
});

// Inspect key
openpgpRouter.post('/inspect-key', async (req: Request, res: Response) => {
  try {
    const { armoredKey } = req.body;
    if (!armoredKey || typeof armoredKey !== 'string' || !armoredKey.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_ARMORED_KEY',
          message: 'armoredKey is required for key inspection',
        },
      });
      return;
    }

    const inspection = await OpenPGPService.inspectKey(armoredKey);
    if (!inspection.isValid) {
      res.status(422).json({
        error: {
          code: 'INVALID_OPENPGP_KEY',
          message: inspection.error || 'Failed to parse OpenPGP key block',
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
        code: 'KEY_INSPECTION_FAILED',
        message: err.message || 'Key inspection error',
      },
    });
  }
});

// OpenPGP Encrypt
openpgpRouter.post('/encrypt', async (req: Request, res: Response) => {
  try {
    const { content, recipientPublicKey, signingPrivateKey, passphrase, useSampleKey } = req.body;
    const creds = await initializeSampleCredentials();

    let pubKey = recipientPublicKey;
    let signKey = signingPrivateKey;

    if (useSampleKey) {
      pubKey = creds.openpgp.bob.publicKey;
      signKey = creds.openpgp.bob.privateKey;
    } else if (!pubKey || typeof pubKey !== 'string' || !pubKey.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_RECIPIENT_KEY',
          message: 'A valid recipient OpenPGP public key (recipientPublicKey) is required for encryption (or specify useSampleKey: true)',
        },
      });
      return;
    }

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        error: {
          code: 'MISSING_CONTENT',
          message: 'Content string is required for OpenPGP encryption',
        },
      });
      return;
    }

    const result = await OpenPGPService.encrypt(content, pubKey, signKey, passphrase);

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'OpenPGP',
      action: 'OpenPGP Message Encryption',
      sender: signKey ? 'Sender (Signed)' : 'Anonymous Sender',
      recipient: `Key [${result.recipientFingerprint.slice(0, 16)}...]`,
      status: 'SUCCESS',
      verificationStatus: result.signed ? 'VERIFIED' : 'NOT_APPLICABLE',
      details: `Encrypted payload into RFC 4880 OpenPGP ASCII Armor block. Signed: ${result.signed}`,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    const isCryptoInvalid = err.message?.includes('key') || err.message?.includes('Armor') || err.message?.includes('parse');
    res.status(isCryptoInvalid ? 422 : 500).json({
      error: {
        code: isCryptoInvalid ? 'INVALID_KEY_MATERIAL' : 'ENCRYPTION_FAILED',
        message: err.message || 'OpenPGP encryption failed',
      },
    });
  }
});

// OpenPGP Decrypt
openpgpRouter.post('/decrypt', async (req: Request, res: Response) => {
  try {
    const { ciphertext, privateKey, passphrase, senderPublicKey, useSampleKey } = req.body;
    const creds = await initializeSampleCredentials();

    let privKey = privateKey;
    let verifyKey = senderPublicKey;

    if (useSampleKey) {
      privKey = creds.openpgp.bob.privateKey;
      verifyKey = creds.openpgp.bob.publicKey;
    } else if (!privKey || typeof privKey !== 'string' || !privKey.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_DECRYPTION_KEY',
          message: 'privateKey is required for OpenPGP decryption (or specify useSampleKey: true)',
        },
      });
      return;
    }

    if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_CIPHERTEXT',
          message: 'Ciphertext is required for decryption',
        },
      });
      return;
    }

    const result = await OpenPGPService.decrypt(ciphertext, privKey, passphrase, verifyKey);

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'OpenPGP',
      action: 'OpenPGP Message Decryption',
      sender: result.signerKeyID ? `Signer ID: 0x${result.signerKeyID}` : 'Encrypted Envelope',
      recipient: 'Authorized Key Owner',
      status: 'SUCCESS',
      verificationStatus: result.signatureVerified ? 'VERIFIED' : result.hasSignatures ? 'FAILED' : 'NOT_APPLICABLE',
      details: result.hasSignatures
        ? `Decryption succeeded. Signature verification: ${result.signatureVerified ? 'VALID' : 'FAILED'}.`
        : 'Decryption succeeded. No digital signature present in packet stream.',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    const isBadCiphertext = err.message?.includes('passphrase') || err.message?.includes('key') || err.message?.includes('integrity');
    res.status(isBadCiphertext ? 422 : 500).json({
      error: {
        code: isBadCiphertext ? 'DECRYPTION_INVALID_KEY_OR_PAYLOAD' : 'DECRYPTION_FAILED',
        message: err.message || 'OpenPGP decryption failed',
      },
    });
  }
});

// OpenPGP Sign
openpgpRouter.post('/sign', async (req: Request, res: Response) => {
  try {
    const { content, privateKey, passphrase, detached, useSampleKey } = req.body;
    const creds = await initializeSampleCredentials();

    let privKey = privateKey;
    if (useSampleKey) {
      privKey = creds.openpgp.bob.privateKey;
    } else if (!privKey || typeof privKey !== 'string' || !privKey.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_SIGNING_KEY',
          message: 'privateKey is required for OpenPGP signing (or specify useSampleKey: true)',
        },
      });
      return;
    }

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        error: {
          code: 'MISSING_CONTENT',
          message: 'Content is required for signing',
        },
      });
      return;
    }

    const result = await OpenPGPService.sign(content, privKey, passphrase, !!detached);

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'OpenPGP',
      action: detached ? 'OpenPGP Detached Signature Creation' : 'OpenPGP Cleartext Signature Creation',
      sender: `Key [${result.fingerprint.slice(0, 16)}...]`,
      recipient: 'Recipients / Verifiers',
      status: 'SUCCESS',
      verificationStatus: 'VERIFIED',
      details: `Created OpenPGP signature using key fingerprint ${result.fingerprint.slice(0, 16)}...`,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'SIGNING_FAILED',
        message: err.message || 'OpenPGP signing failed',
      },
    });
  }
});

// OpenPGP Verify
openpgpRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const { contentOrCleartext, publicKey, detachedSignature, useSampleKey } = req.body;
    const creds = await initializeSampleCredentials();

    let pubKey = publicKey;
    if (useSampleKey) {
      pubKey = creds.openpgp.bob.publicKey;
    } else if (!pubKey || typeof pubKey !== 'string' || !pubKey.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_VERIFICATION_KEY',
          message: 'publicKey is required for OpenPGP verification (or specify useSampleKey: true)',
        },
      });
      return;
    }

    if (!contentOrCleartext || typeof contentOrCleartext !== 'string' || !contentOrCleartext.trim()) {
      res.status(400).json({
        error: {
          code: 'MISSING_VERIFY_PAYLOAD',
          message: 'contentOrCleartext is required for signature verification',
        },
      });
      return;
    }

    const result = await OpenPGPService.verify(contentOrCleartext, pubKey, detachedSignature);

    addAuditLog({
      category: 'CRYPTOGRAPHIC_OPERATION',
      protocol: 'OpenPGP',
      action: 'OpenPGP Signature Verification',
      sender: `Key ID 0x${result.keyID}`,
      recipient: 'Gateway Verifier',
      status: result.verified ? 'SUCCESS' : 'FAILED',
      verificationStatus: result.verified ? 'VERIFIED' : 'FAILED',
      details: result.verified
        ? `Cryptographic signature verified against key ${result.publicKeyFingerprint.slice(0, 16)}...`
        : 'OpenPGP signature verification failed: invalid signature packet or modified data.',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(422).json({
      error: {
        code: 'VERIFICATION_ERROR',
        message: err.message || 'OpenPGP verification error: payload modified or key mismatch',
      },
    });
  }
});

// Sample credentials
openpgpRouter.get('/sample-credentials', async (_req: Request, res: Response) => {
  try {
    const creds = await initializeSampleCredentials();
    res.json({
      bob: creds.openpgp.bob,
      charlie: creds.openpgp.charlie,
      gateway: creds.openpgp.gateway,
    });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'CREDENTIALS_FAILED',
        message: err.message || 'Failed to load sample OpenPGP credentials',
      },
    });
  }
});
