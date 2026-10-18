import { Router, Request, Response } from 'express';
import { getCredentialsInventory, addCredentialItem, removeCredentialItem, initializeSampleCredentials } from '../data/sampleKeys.js';
import { SmimeService } from '../crypto/smimeService.js';
import { OpenPGPService } from '../crypto/openpgpService.js';
import { addAuditLog } from '../data/auditStore.js';

export const credentialsRouter = Router();

credentialsRouter.get('/credentials', async (_req: Request, res: Response) => {
  try {
    await initializeSampleCredentials();
    const inventory = getCredentialsInventory();
    res.json({
      success: true,
      data: inventory,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve credentials inventory' });
  }
});

credentialsRouter.post('/credentials/import', async (req: Request, res: Response) => {
  try {
    const { rawText, ownerName, email, type } = req.body;
    if (!rawText || !rawText.trim()) {
      res.status(400).json({ error: 'Certificate PEM or OpenPGP public key is required' });
      return;
    }

    if (type === 'SMIME' || rawText.includes('BEGIN CERTIFICATE')) {
      const inspection = SmimeService.inspectCertificate(rawText);
      if (!inspection.isValid) {
        res.status(422).json({ error: inspection.error || 'Failed to parse X.509 certificate' });
        return;
      }

      const newItem = {
        id: `smime-${Date.now().toString(36)}`,
        ownerName: ownerName || inspection.subject || 'Imported User',
        email: email || (inspection.san && inspection.san[0]) || 'imported@user.local',
        type: 'SMIME_CERT' as const,
        fingerprint: inspection.fingerprint256,
        algorithm: `${inspection.keyAlgorithm} (${inspection.keySize || '2048'}-bit)`,
        createdAt: inspection.validFrom,
        expiresAt: inspection.validTo,
        isTrusted: false,
        trustSource: 'Imported User Certificate (Unanchored Demo)',
        isSample: false,
        hasPrivateKey: false,
        certificatePem: rawText,
        issuer: inspection.issuer,
        subject: inspection.subject,
      };

      addCredentialItem(newItem);
      addAuditLog({
        category: 'KEY_MANAGEMENT',
        protocol: 'S/MIME',
        action: 'Imported X.509 Certificate',
        sender: 'Security Administrator',
        recipient: newItem.email,
        status: 'SUCCESS',
        verificationStatus: 'UNVERIFIED',
        details: `Imported certificate for ${newItem.ownerName}. Trust status: Unanchored self-signed/demo.`,
      });

      res.json({ success: true, data: newItem });
    } else {
      // OpenPGP Key
      const inspection = await OpenPGPService.inspectKey(rawText);
      if (!inspection.isValid) {
        res.status(422).json({ error: inspection.error || 'Failed to parse OpenPGP key block' });
        return;
      }

      const newItem = {
        id: `pgp-${Date.now().toString(36)}`,
        ownerName: ownerName || inspection.primaryUserID || 'Imported PGP User',
        email: email || 'pgp-user@domain.local',
        type: 'OPENPGP_KEY' as const,
        fingerprint: inspection.fingerprint || '',
        algorithm: inspection.algorithm || 'RSA/ECC',
        createdAt: inspection.creationTime || new Date().toISOString(),
        expiresAt: inspection.expirationTime || 'Never',
        isTrusted: false,
        trustSource: 'Imported Public Key (Unverified Web of Trust)',
        isSample: false,
        hasPrivateKey: false,
        publicKeyArmored: rawText,
      };

      addCredentialItem(newItem);
      addAuditLog({
        category: 'KEY_MANAGEMENT',
        protocol: 'OpenPGP',
        action: 'Imported OpenPGP Public Key',
        sender: 'Security Administrator',
        recipient: newItem.email,
        status: 'SUCCESS',
        verificationStatus: 'UNVERIFIED',
        details: `Imported OpenPGP public key [${newItem.fingerprint.slice(0, 16)}...] into gateway keyring.`,
      });

      res.json({ success: true, data: newItem });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to import credential' });
  }
});

credentialsRouter.delete('/credentials/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = removeCredentialItem(id);
    if (!removed) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }

    addAuditLog({
      category: 'KEY_MANAGEMENT',
      protocol: 'SYSTEM',
      action: 'Credential Deletion',
      sender: 'Security Administrator',
      recipient: id,
      status: 'SUCCESS',
      verificationStatus: 'NOT_APPLICABLE',
      details: `Revoked and removed credential item ${id} from gateway local truststore.`,
    });

    res.json({ success: true, message: 'Credential removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete credential' });
  }
});
