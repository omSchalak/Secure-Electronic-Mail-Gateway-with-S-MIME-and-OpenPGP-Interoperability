import { describe, it, expect, beforeAll } from 'vitest';
import { SmimeService } from '../crypto/smimeService.js';
import { OpenPGPService } from '../crypto/openpgpService.js';
import { GatewayEngine } from '../crypto/gatewayEngine.js';
import { initializeSampleCredentials } from '../data/sampleKeys.js';

describe('Secure Electronic Mail Gateway Cryptography & Interoperability Test Suite', () => {
  beforeAll(async () => {
    await initializeSampleCredentials();
  });

  describe('S/MIME X.509 Cryptographic Operations', () => {
    let testCert: any;

    it('should generate a valid X.509 Certificate and RSA Key Pair', () => {
      testCert = SmimeService.generateCertificate('Alice Test', 'alice@test.local', 'Test Org', 1);
      expect(testCert.certPem).toContain('-----BEGIN CERTIFICATE-----');
      expect(testCert.privateKeyPem).toContain('-----BEGIN RSA PRIVATE KEY-----');
      expect(testCert.subject).toBe('Alice Test');
      expect(testCert.email).toBe('alice@test.local');
    });

    it('should inspect and parse X.509 Certificate attributes correctly', () => {
      const inspection = SmimeService.inspectCertificate(testCert.certPem);
      expect(inspection.isValid).toBe(true);
      expect(inspection.keyAlgorithm).toBe('rsa');
      expect(inspection.fingerprint256).toBeDefined();
      expect(inspection.isDateValid).toBe(true);
      expect(inspection.isSelfSigned).toBe(true);
      expect(inspection.trustChainEstablished).toBe(false); // Honest demo status
    });

    it('should fail cleanly when given invalid or malformed certificate data', () => {
      const inspection = SmimeService.inspectCertificate('--- INVALID DATA NOT A CERT ---');
      expect(inspection.isValid).toBe(false);
      expect(inspection.error).toBeDefined();
    });

    it('should sign and verify S/MIME PKCS#7 SignedData message', () => {
      const message = 'Confidential Academic Assessment Payload';
      const signed = SmimeService.signMessage(message, testCert.privateKeyPem, testCert.certPem);
      expect(signed.success).toBe(true);
      expect(signed.signedPem).toContain('-----BEGIN PKCS7-----');

      const verification = SmimeService.verifySignature(signed.signedPem!);
      expect(verification.verified).toBe(true);
      expect(verification.signerCertSubject).toContain('Alice Test');
    });

    it('should encrypt and decrypt S/MIME PKCS#7 EnvelopedData', () => {
      const secret = 'Top Secret Strategic Communication';
      const enc = SmimeService.encryptMessage(secret, testCert.certPem);
      expect(enc.success).toBe(true);
      expect(enc.encryptedPem).toContain('-----BEGIN PKCS7-----');

      const dec = SmimeService.decryptMessage(enc.encryptedPem!, testCert.privateKeyPem, testCert.certPem);
      expect(dec.success).toBe(true);
      expect(dec.plaintext).toBe(secret);
    });
  });

  describe('OpenPGP RFC 4880 Cryptographic Operations', () => {
    let testPgpKey: any;

    it('should generate an OpenPGP ECC Key Pair', async () => {
      testPgpKey = await OpenPGPService.generateKeyPair('Bob PGP', 'bob@test.local');
      expect(testPgpKey.publicKey).toContain('-----BEGIN PGP PUBLIC KEY BLOCK-----');
      expect(testPgpKey.privateKey).toContain('-----BEGIN PGP PRIVATE KEY BLOCK-----');
      expect(testPgpKey.fingerprint).toBeDefined();
      expect(testPgpKey.algorithm).toContain('ECC');
    });

    it('should inspect an OpenPGP public key block', async () => {
      const inspection = await OpenPGPService.inspectKey(testPgpKey.publicKey);
      expect(inspection.isValid).toBe(true);
      expect(inspection.isPrivate).toBe(false);
      expect(inspection.primaryUserID).toContain('Bob PGP');
      expect(inspection.fingerprint).toBe(testPgpKey.fingerprint);
    });

    it('should encrypt and decrypt an OpenPGP message', async () => {
      const plaintext = 'Classified OpenPGP message body';
      const enc = await OpenPGPService.encrypt(plaintext, testPgpKey.publicKey, testPgpKey.privateKey);
      expect(enc.ciphertext).toContain('-----BEGIN PGP MESSAGE-----');

      const dec = await OpenPGPService.decrypt(enc.ciphertext, testPgpKey.privateKey, undefined, testPgpKey.publicKey);
      expect(dec.plaintext).toBe(plaintext);
      expect(dec.signatureVerified).toBe(true);
    });

    it('should generate and verify cleartext OpenPGP signature', async () => {
      const text = 'Integrity protected statement';
      const signed = await OpenPGPService.sign(text, testPgpKey.privateKey);
      expect(signed.cleartextSigned).toContain('-----BEGIN PGP SIGNED MESSAGE-----');

      const verify = await OpenPGPService.verify(signed.cleartextSigned!, testPgpKey.publicKey);
      expect(verify.verified).toBe(true);
      expect(verify.plaintext?.trim()).toBe(text.trim());
    });
  });

  describe('Protocol Interoperability Engine Scenarios', () => {
    it('Scenario 1: S/MIME to S/MIME direct routing', async () => {
      const res = await GatewayEngine.runScenario('scenario-1');
      expect(res.decision).toBe('DIRECT_ROUTING');
      expect(res.status).toBe('SUCCESS');
      expect(res.verificationOutcome.signatureValid).toBe(true);
    });

    it('Scenario 2: OpenPGP to OpenPGP direct routing', async () => {
      const res = await GatewayEngine.runScenario('scenario-2');
      expect(res.decision).toBe('DIRECT_ROUTING');
      expect(res.status).toBe('SUCCESS');
      expect(res.verificationOutcome.signatureValid).toBe(true);
    });

    it('Scenario 3: S/MIME to OpenPGP controlled decrypt-and-re-encrypt', async () => {
      const res = await GatewayEngine.runScenario('scenario-3');
      expect(res.decision).toBe('CONTROLLED_TRANSFORMATION');
      expect(res.status).toBe('SUCCESS');
      expect(res.transformationDetails?.decryptedByGateway).toBe(true);
      expect(res.transformationDetails?.reEncryptedForRecipient).toBe(true);
      expect(res.finalOutput.deliveredFormat).toContain('OpenPGP');
    });

    it('Scenario 4: OpenPGP to S/MIME controlled decrypt-and-re-encrypt', async () => {
      const res = await GatewayEngine.runScenario('scenario-4');
      expect(res.decision).toBe('CONTROLLED_TRANSFORMATION');
      expect(res.status).toBe('SUCCESS');
      expect(res.transformationDetails?.decryptedByGateway).toBe(true);
      expect(res.transformationDetails?.reEncryptedForRecipient).toBe(true);
      expect(res.finalOutput.deliveredFormat).toContain('S/MIME');
    });

    it('Scenario 5: Missing recipient credentials policy halt', async () => {
      const res = await GatewayEngine.runScenario('scenario-5');
      expect(res.decision).toBe('REJECT_POLICY');
      expect(res.status).toBe('FAILED');
      expect(res.finalOutput.deliveredFormat).toContain('None (Delivery Blocked)');
    });

    it('Scenario 6: Tamper detection and signature verification failure', async () => {
      const res = await GatewayEngine.runScenario('scenario-6');
      expect(res.decision).toBe('REJECT_SIGNATURE');
      expect(res.status).toBe('FAILED');
      expect(res.verificationOutcome.signatureValid).toBe(false);
    });
  });
});
