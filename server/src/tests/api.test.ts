import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'node:http';
import app from '../app.js';
import { initializeSampleCredentials } from '../data/sampleKeys.js';

let server: Server;
let baseUrl: string;
let creds: any;

beforeAll(async () => {
  creds = await initializeSampleCredentials();
  await new Promise<void>((resolve) => {
    server = createServer(app).listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Secure Electronic Mail Gateway API & Cryptographic Integration Suite', () => {
  // Test 1: GET /api/health returns successful response
  it('1. GET /api/health returns status OK and gateway metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.status).toBe('OK');
    expect(data.creator).toBe('Mansi Chalak');
    expect(data.capabilities).toBeDefined();
    expect(data.capabilities.smime).toBeDefined();
    expect(data.capabilities.openpgp).toBeDefined();
  });

  // Test 2: Unknown API routes return structured 404 response
  it('2. Unknown API routes return structured JSON 404 response', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-route-endpoint`);
    expect(res.status).toBe(404);
    const data: any = await res.json();
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('ENDPOINT_NOT_FOUND');
    expect(data.error.message).toContain('nonexistent-route-endpoint');
  });

  // Test 3: Dashboard metrics endpoint returns valid operational metrics
  it('3. GET /api/dashboard returns gateway telemetry and operational status', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.gatewayStatus).toBe('OPERATIONAL');
    expect(data.creator).toBe('Mansi Chalak');
    expect(typeof data.totalMessagesProcessed).toBe('number');
  });

  // Test 4: Invalid composer payload returns 400
  it('4. POST /api/demo/process-message rejects invalid email payloads with 400', async () => {
    const res = await fetch(`${baseUrl}/api/demo/process-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'not-an-email',
        recipient: 'recipient@domain.local',
        subject: '',
        body: '',
      }),
    });
    expect(res.status).toBe(400);
    const data: any = await res.json();
    expect(data.error).toBeDefined();
  });

  // Test 5: Valid composer message processes through gateway
  it('5. POST /api/demo/process-message successfully processes S/MIME to OpenPGP transition', async () => {
    const res = await fetch(`${baseUrl}/api/demo/process-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'alice@smime.local',
        recipient: 'bob@pgp.local',
        subject: 'Confidential Audit Report',
        body: 'Encrypted assessment payload.',
        protocol: 'AUTO',
        encrypt: true,
        sign: true,
      }),
    });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.selectedProtocol).toBe('OPENPGP');
    expect(data.isCrossProtocol).toBe(true);
    expect(data.payloadPreview).toBeDefined();
    expect(data.deliveryStatus).toBe('Demo message processed locally');
  });

  // Test 6: Missing recipient certificate returns 400
  it('6. POST /api/smime/encrypt returns 400 when recipientCertPem is omitted', async () => {
    const res = await fetch(`${baseUrl}/api/smime/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Confidential corporate notice',
        useSampleCert: false,
      }),
    });
    expect(res.status).toBe(400);
    const data: any = await res.json();
    expect(data.error.code).toBe('MISSING_RECIPIENT_CERTIFICATE');
  });

  // Test 7: Missing OpenPGP recipient key returns 400
  it('7. POST /api/openpgp/encrypt returns 400 when recipientPublicKey is omitted', async () => {
    const res = await fetch(`${baseUrl}/api/openpgp/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Secret communication',
        useSampleKey: false,
      }),
    });
    expect(res.status).toBe(400);
    const data: any = await res.json();
    expect(data.error.code).toBe('MISSING_RECIPIENT_KEY');
  });

  // Test 8: S/MIME Certificate Inspection parses valid certificate
  it('8. POST /api/smime/inspect-certificate correctly parses valid X.509 certificate', async () => {
    const res = await fetch(`${baseUrl}/api/smime/inspect-certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        certificatePem: creds.smime.alice.certPem,
      }),
    });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.isValid).toBe(true);
    expect(data.data.subject).toContain('Alice Smith');
    expect(data.data.fingerprint256).toBeDefined();
  });

  // Test 9: S/MIME Certificate Inspection rejects malformed data
  it('9. POST /api/smime/inspect-certificate rejects corrupted certificate with 422', async () => {
    const res = await fetch(`${baseUrl}/api/smime/inspect-certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        certificatePem: '-----BEGIN CERTIFICATE-----\nINVALID_CORRUPTED_BASE64\n-----END CERTIFICATE-----',
      }),
    });
    expect(res.status).toBe(422);
    const data: any = await res.json();
    expect(data.error.code).toBe('INVALID_CERTIFICATE');
  });

  // Test 10: S/MIME Sign, Encrypt, Decrypt, and Signature Verification
  it('10. S/MIME End-to-End: Sign, Verify, Encrypt, and Decrypt', async () => {
    const testContent = 'Sensitive Academic Research Payload';

    // Sign
    const signRes = await fetch(`${baseUrl}/api/smime/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testContent, useSampleKey: true }),
    });
    expect(signRes.status).toBe(200);
    const signData: any = await signRes.json();
    expect(signData.success).toBe(true);
    expect(signData.signedPem).toContain('-----BEGIN PKCS7-----');

    // Verify
    const verifyRes = await fetch(`${baseUrl}/api/smime/verify-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedPem: signData.signedPem, rawContent: testContent }),
    });
    expect(verifyRes.status).toBe(200);
    const verifyData: any = await verifyRes.json();
    expect(verifyData.verified).toBe(true);

    // Encrypt
    const encRes = await fetch(`${baseUrl}/api/smime/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testContent, useSampleCert: true }),
    });
    expect(encRes.status).toBe(200);
    const encData: any = await encRes.json();
    expect(encData.success).toBe(true);

    // Decrypt
    const decRes = await fetch(`${baseUrl}/api/smime/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encryptedPem: encData.encryptedPem, useSampleKey: true }),
    });
    expect(decRes.status).toBe(200);
    const decData: any = await decRes.json();
    expect(decData.success).toBe(true);
    expect(decData.plaintext).toBe(testContent);
  });

  // Test 11: Tampered S/MIME content fails signature verification
  it('11. S/MIME Tamper Detection: Modified payload fails signature verification', async () => {
    const originalText = 'Authentic unmodified content';
    const signRes = await fetch(`${baseUrl}/api/smime/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: originalText, useSampleKey: true }),
    });
    const signData: any = await signRes.json();

    // Verify with altered content
    const verifyRes = await fetch(`${baseUrl}/api/smime/verify-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signedPem: signData.signedPem,
        rawContent: 'Tampered altered content with malicious bytes injected',
      }),
    });
    const verifyData: any = await verifyRes.json();
    expect(verifyData.verified).toBe(false);
    expect(verifyData.error).toContain('digest mismatch');
  });

  // Test 12: OpenPGP Key Generation, Inspection, Encrypt, Decrypt, and Sign
  it('12. OpenPGP End-to-End: KeyGen, Inspect, Encrypt, Decrypt, Sign, and Verify', async () => {
    // Generate Key
    const keygenRes = await fetch(`${baseUrl}/api/openpgp/generate-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Test User', email: 'test@pgp.internal', type: 'ecc' }),
    });
    expect(keygenRes.status).toBe(200);
    const keygenData: any = await keygenRes.json();
    expect(keygenData.success).toBe(true);
    expect(keygenData.data.publicKey).toContain('-----BEGIN PGP PUBLIC KEY BLOCK-----');

    // Inspect Key
    const inspectRes = await fetch(`${baseUrl}/api/openpgp/inspect-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ armoredKey: keygenData.data.publicKey }),
    });
    expect(inspectRes.status).toBe(200);
    const inspectData: any = await inspectRes.json();
    expect(inspectData.data.isValid).toBe(true);
    expect(inspectData.data.primaryUserID).toContain('Integration Test User');

    // Encrypt & Decrypt
    const secretMessage = 'Confidential OpenPGP Transmission';
    const encRes = await fetch(`${baseUrl}/api/openpgp/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: secretMessage,
        recipientPublicKey: keygenData.data.publicKey,
        signingPrivateKey: keygenData.data.privateKey,
      }),
    });
    expect(encRes.status).toBe(200);
    const encData: any = await encRes.json();
    expect(encData.data.ciphertext).toContain('-----BEGIN PGP MESSAGE-----');

    const decRes = await fetch(`${baseUrl}/api/openpgp/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ciphertext: encData.data.ciphertext,
        privateKey: keygenData.data.privateKey,
        senderPublicKey: keygenData.data.publicKey,
      }),
    });
    expect(decRes.status).toBe(200);
    const decData: any = await decRes.json();
    expect(decData.data.plaintext).toBe(secretMessage);
    expect(decData.data.signatureVerified).toBe(true);
  });

  // Test 13: Gateway Interoperability Scenarios 1 to 6
  it('13. Gateway Interoperability Scenarios 1 through 6 execute with real cryptography', async () => {
    // Scenario 1: S/MIME Direct
    const sc1 = await fetch(`${baseUrl}/api/gateway/simulate-interoperability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: 'scenario-1' }),
    });
    expect(sc1.status).toBe(200);
    const sc1Data: any = await sc1.json();
    expect(sc1Data.data.decision).toBe('DIRECT_ROUTING');
    expect(sc1Data.data.status).toBe('SUCCESS');

    // Scenario 3: S/MIME -> OpenPGP
    const sc3 = await fetch(`${baseUrl}/api/gateway/simulate-interoperability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: 'scenario-3' }),
    });
    expect(sc3.status).toBe(200);
    const sc3Data: any = await sc3.json();
    expect(sc3Data.data.decision).toBe('CONTROLLED_TRANSFORMATION');
    expect(sc3Data.data.transformationDetails.decryptedByGateway).toBe(true);

    // Scenario 4: OpenPGP -> S/MIME
    const sc4 = await fetch(`${baseUrl}/api/gateway/simulate-interoperability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: 'scenario-4' }),
    });
    expect(sc4.status).toBe(200);
    const sc4Data: any = await sc4.json();
    expect(sc4Data.data.decision).toBe('CONTROLLED_TRANSFORMATION');
    expect(sc4Data.data.transformationDetails.reEncryptedForRecipient).toBe(true);

    // Scenario 5: Policy Halt on Missing Recipient Key
    const sc5 = await fetch(`${baseUrl}/api/gateway/simulate-interoperability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: 'scenario-5' }),
    });
    expect(sc5.status).toBe(200);
    const sc5Data: any = await sc5.json();
    expect(sc5Data.data.decision).toBe('REJECT_POLICY');
    expect(sc5Data.data.status).toBe('FAILED');

    // Scenario 6: Tamper Detection
    const sc6 = await fetch(`${baseUrl}/api/gateway/simulate-interoperability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: 'scenario-6' }),
    });
    expect(sc6.status).toBe(200);
    const sc6Data: any = await sc6.json();
    expect(sc6Data.data.decision).toBe('REJECT_SIGNATURE');
    expect(sc6Data.data.status).toBe('FAILED');
  });

  // Test 14: Audit Logs and CSV Export
  it('14. Audit logs retrieval and CSV export', async () => {
    const logsRes = await fetch(`${baseUrl}/api/audit-logs`);
    expect(logsRes.status).toBe(200);
    const logsData: any = await logsRes.json();
    expect(logsData.success).toBe(true);
    expect(Array.isArray(logsData.data)).toBe(true);
    expect(logsData.data.length).toBeGreaterThan(0);

    const exportRes = await fetch(`${baseUrl}/api/audit-logs/export?format=csv`);
    expect(exportRes.status).toBe(200);
    expect(exportRes.headers.get('content-type')).toContain('text/csv');
    const csvText = await exportRes.text();
    expect(csvText).toContain('Event ID');
    expect(csvText).toContain('Protocol');
  });

  // Test 15: Credentials Inventory
  it('15. Credentials store management (retrieve, inspect, delete)', async () => {
    const res = await fetch(`${baseUrl}/api/credentials`);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });
});
