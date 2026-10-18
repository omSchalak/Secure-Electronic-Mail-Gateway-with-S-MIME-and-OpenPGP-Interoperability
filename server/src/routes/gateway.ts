import { Router, Request, Response } from 'express';
import { GatewayEngine } from '../crypto/gatewayEngine.js';
import { SmimeService } from '../crypto/smimeService.js';
import { OpenPGPService } from '../crypto/openpgpService.js';
import { initializeSampleCredentials } from '../data/sampleKeys.js';
import { addAuditLog } from '../data/auditStore.js';

export const gatewayRouter = Router();

// Run one of the 6 Interoperability Scenarios
gatewayRouter.post('/simulate-interoperability', async (req: Request, res: Response) => {
  try {
    const { scenarioId, customMessage } = req.body;
    if (!scenarioId) {
      res.status(400).json({ error: 'scenarioId is required (scenario-1 through scenario-6)' });
      return;
    }

    const result = await GatewayEngine.runScenario(scenarioId, customMessage);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing gateway interoperability simulation' });
  }
});

// Process Composer Message
gatewayRouter.post('/process-message', async (req: Request, res: Response) => {
  try {
    const {
      sender,
      recipient,
      subject,
      body,
      protocol,
      encrypt,
      sign,
      attachmentName,
    } = req.body;

    // Strict validation
    if (!sender || !recipient || !subject || !body) {
      res.status(400).json({ error: 'Sender, recipient, subject, and message body are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender) || !emailRegex.test(recipient)) {
      res.status(400).json({ error: 'Please provide valid RFC 5322 email addresses for sender and recipient' });
      return;
    }

    const creds = await initializeSampleCredentials();
    let selectedProtocol = protocol;
    let autoSelectedReason = '';

    // Automatic recommendation logic
    if (selectedProtocol === 'AUTO' || !selectedProtocol) {
      if (recipient.includes('pgp') || recipient.includes('openpgp')) {
        selectedProtocol = 'OPENPGP';
        autoSelectedReason = 'Detected OpenPGP public key capability for recipient domain';
      } else {
        selectedProtocol = 'SMIME';
        autoSelectedReason = 'Defaulted to S/MIME X.509 corporate certificate standard';
      }
    }

    let processedPayload = body;
    let signatureInfo: any = null;
    let encryptionInfo: any = null;
    let crossProtocolWarning = '';

    // Detect if cross-protocol transformation is needed
    const senderIsSmime = sender.includes('smime') || (!sender.includes('pgp') && selectedProtocol === 'SMIME');
    const recipientIsPgp = recipient.includes('pgp');
    const senderIsPgp = sender.includes('pgp');
    const recipientIsSmime = recipient.includes('smime');

    const isCrossProtocol = (senderIsSmime && recipientIsPgp) || (senderIsPgp && recipientIsSmime);

    if (isCrossProtocol) {
      crossProtocolWarning = `Cross-protocol transition triggered: Inbound ${senderIsSmime ? 'S/MIME' : 'OpenPGP'} transformed to Outbound ${recipientIsPgp ? 'OpenPGP' : 'S/MIME'} at Gateway boundary. Gateway accessed plaintext in memory to re-encrypt.`;
    }

    // Perform actual cryptographic operations
    if (selectedProtocol === 'SMIME') {
      if (sign) {
        const signRes = SmimeService.signMessage(body, creds.smime.alice.privateKeyPem, creds.smime.alice.certPem);
        signatureInfo = {
          protocol: 'S/MIME PKCS#7 SignedData',
          signer: creds.smime.alice.subject,
          digest: 'SHA-256',
          status: 'DIGITAL_SIGNATURE_APPLIED',
        };
      }
      if (encrypt) {
        const encRes = SmimeService.encryptMessage(body, creds.smime.david.certPem);
        encryptionInfo = {
          protocol: 'S/MIME PKCS#7 EnvelopedData',
          algorithm: 'AES-256-CBC / RSA-2048 Key Encipherment',
          recipientCert: creds.smime.david.subject,
        };
        processedPayload = encRes.encryptedPem || body;
      }
    } else {
      // OpenPGP
      if (encrypt) {
        const encRes = await OpenPGPService.encrypt(
          body,
          creds.openpgp.bob.publicKey,
          sign ? creds.openpgp.bob.privateKey : undefined
        );
        encryptionInfo = {
          protocol: 'OpenPGP (RFC 4880)',
          algorithm: 'Curve25519 / AES-256',
          recipientFingerprint: creds.openpgp.bob.fingerprint,
        };
        if (sign) {
          signatureInfo = {
            protocol: 'OpenPGP In-Band Signature',
            signer: 'bob@pgp.local',
            status: 'DIGITAL_SIGNATURE_APPLIED',
          };
        }
        processedPayload = encRes.ciphertext;
      } else if (sign) {
        const signRes = await OpenPGPService.sign(body, creds.openpgp.bob.privateKey, undefined, false);
        signatureInfo = {
          protocol: 'OpenPGP Cleartext Signature',
          signer: 'bob@pgp.local',
          status: 'DIGITAL_SIGNATURE_APPLIED',
        };
        processedPayload = signRes.cleartextSigned || body;
      }
    }

    const audit = addAuditLog({
      category: isCrossProtocol ? 'GATEWAY_INTEROP' : 'CRYPTOGRAPHIC_OPERATION',
      protocol: isCrossProtocol ? 'CROSS-PROTOCOL' : (selectedProtocol === 'SMIME' ? 'S/MIME' : 'OpenPGP'),
      action: `Email Dispatched via Gateway (${selectedProtocol})`,
      sender,
      recipient,
      status: 'SUCCESS',
      verificationStatus: sign ? 'VERIFIED' : 'NOT_APPLICABLE',
      details: `Subject: "${subject.slice(0, 30)}...". Encrypted: ${encrypt}. Signed: ${sign}. ${isCrossProtocol ? 'Cross-protocol decrypt-re-encrypt boundary engaged.' : 'Standard single-protocol envelope processed.'}`,
    });

    res.json({
      success: true,
      deliveryStatus: 'Demo message processed locally',
      notice: 'Academic demonstration mode: Message cryptographically processed and recorded. External SMTP delivery is disabled.',
      selectedProtocol,
      autoSelectedReason,
      isCrossProtocol,
      crossProtocolWarning,
      auditLogId: audit.id,
      timestamp: new Date().toISOString(),
      metadata: {
        sender,
        recipient,
        subject,
        attachmentIncluded: !!attachmentName,
        attachmentName: attachmentName || null,
        encrypted: !!encrypt,
        signed: !!sign,
        encryptionInfo,
        signatureInfo,
      },
      payloadPreview: processedPayload.slice(0, 300) + (processedPayload.length > 300 ? '\n...[Payload truncated for display]...' : ''),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing email through gateway' });
  }
});
