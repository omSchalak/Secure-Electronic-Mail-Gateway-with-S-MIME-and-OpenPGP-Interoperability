import { OpenPGPService } from '../crypto/openpgpService.js';
import { SmimeService } from '../crypto/smimeService.js';
import { CredentialItem } from '../types/index.js';

export interface SampleCredentialsStore {
  smime: {
    alice: { certPem: string; privateKeyPem: string; subject: string; email: string };
    david: { certPem: string; privateKeyPem: string; subject: string; email: string };
    gateway: { certPem: string; privateKeyPem: string; subject: string; email: string };
    expired: { certPem: string; privateKeyPem: string; subject: string; email: string };
  };
  openpgp: {
    bob: { publicKey: string; privateKey: string; fingerprint: string; email: string };
    charlie: { publicKey: string; privateKey: string; fingerprint: string; email: string };
    gateway: { publicKey: string; privateKey: string; fingerprint: string; email: string };
  };
}

let cachedCredentials: SampleCredentialsStore | null = null;
let credentialsInventory: CredentialItem[] = [];

export async function initializeSampleCredentials(): Promise<SampleCredentialsStore> {
  if (cachedCredentials) return cachedCredentials;

  console.log('[Crypto] Initializing demonstration cryptographic credentials...');

  // 1. S/MIME Credentials
  const aliceSmime = SmimeService.generateCertificate('Alice Smith (S/MIME Demo)', 'alice@smime.local', 'Secure Gateway Org', 2);
  const davidSmime = SmimeService.generateCertificate('David Vance (S/MIME Demo)', 'david@smime.local', 'Finance Dept', 1);
  const gatewaySmime = SmimeService.generateCertificate('Mail Security Gateway Interop CA', 'gateway@mailsec.internal', 'Gateway Root Trust', 5, true);
  
  // Expired demo certificate
  const expiredSmime = SmimeService.generateCertificate('Expired User (Demo)', 'expired@smime.local', 'Legacy Systems', -1);

  // 2. OpenPGP Credentials
  const bobPgp = await OpenPGPService.generateKeyPair('Bob Martinez', 'bob@pgp.local');
  const charliePgp = await OpenPGPService.generateKeyPair('Charlie Evans', 'charlie@pgp.local');
  const gatewayPgp = await OpenPGPService.generateKeyPair('Gateway Re-encryption Entity', 'gateway@mailsec.internal');

  cachedCredentials = {
    smime: {
      alice: { certPem: aliceSmime.certPem, privateKeyPem: aliceSmime.privateKeyPem, subject: aliceSmime.subject, email: aliceSmime.email },
      david: { certPem: davidSmime.certPem, privateKeyPem: davidSmime.privateKeyPem, subject: davidSmime.subject, email: davidSmime.email },
      gateway: { certPem: gatewaySmime.certPem, privateKeyPem: gatewaySmime.privateKeyPem, subject: gatewaySmime.subject, email: gatewaySmime.email },
      expired: { certPem: expiredSmime.certPem, privateKeyPem: expiredSmime.privateKeyPem, subject: expiredSmime.subject, email: expiredSmime.email },
    },
    openpgp: {
      bob: { publicKey: bobPgp.publicKey, privateKey: bobPgp.privateKey, fingerprint: bobPgp.fingerprint, email: 'bob@pgp.local' },
      charlie: { publicKey: charliePgp.publicKey, privateKey: charliePgp.privateKey, fingerprint: charliePgp.fingerprint, email: 'charlie@pgp.local' },
      gateway: { publicKey: gatewayPgp.publicKey, privateKey: gatewayPgp.privateKey, fingerprint: gatewayPgp.fingerprint, email: 'gateway@mailsec.internal' },
    },
  };

  // Build inventory items (without exposing private keys in public representations)
  const aliceInspection = SmimeService.inspectCertificate(aliceSmime.certPem);
  const davidInspection = SmimeService.inspectCertificate(davidSmime.certPem);
  const gatewayInspection = SmimeService.inspectCertificate(gatewaySmime.certPem);
  const expiredInspection = SmimeService.inspectCertificate(expiredSmime.certPem);

  credentialsInventory = [
    {
      id: 'smime-alice',
      ownerName: 'Alice Smith',
      email: 'alice@smime.local',
      type: 'SMIME_CERT',
      fingerprint: aliceInspection.fingerprint256,
      algorithm: 'RSA-2048 (SHA-256)',
      keySize: 2048,
      createdAt: aliceInspection.validFrom,
      expiresAt: aliceInspection.validTo,
      isTrusted: false,
      trustSource: 'Self-Signed Demo (S/MIME v3)',
      isSample: true,
      hasPrivateKey: true,
      certificatePem: aliceSmime.certPem,
      issuer: aliceInspection.issuer,
      subject: aliceInspection.subject,
    },
    {
      id: 'smime-david',
      ownerName: 'David Vance',
      email: 'david@smime.local',
      type: 'SMIME_CERT',
      fingerprint: davidInspection.fingerprint256,
      algorithm: 'RSA-2048 (SHA-256)',
      keySize: 2048,
      createdAt: davidInspection.validFrom,
      expiresAt: davidInspection.validTo,
      isTrusted: false,
      trustSource: 'Departmental Demo CA',
      isSample: true,
      hasPrivateKey: true,
      certificatePem: davidSmime.certPem,
      issuer: davidInspection.issuer,
      subject: davidInspection.subject,
    },
    {
      id: 'smime-gateway',
      ownerName: 'Mail Security Gateway Interop CA',
      email: 'gateway@mailsec.internal',
      type: 'SMIME_CERT',
      fingerprint: gatewayInspection.fingerprint256,
      algorithm: 'RSA-2048 (SHA-256)',
      keySize: 2048,
      createdAt: gatewayInspection.validFrom,
      expiresAt: gatewayInspection.validTo,
      isTrusted: true,
      trustSource: 'Gateway Trusted Root Anchor',
      isSample: true,
      hasPrivateKey: true,
      certificatePem: gatewaySmime.certPem,
      issuer: gatewayInspection.issuer,
      subject: gatewayInspection.subject,
    },
    {
      id: 'smime-expired',
      ownerName: 'Expired User (Test Scenario)',
      email: 'expired@smime.local',
      type: 'SMIME_CERT',
      fingerprint: expiredInspection.fingerprint256,
      algorithm: 'RSA-2048 (SHA-256)',
      keySize: 2048,
      createdAt: expiredInspection.validFrom,
      expiresAt: expiredInspection.validTo,
      isTrusted: false,
      trustSource: 'EXPIRED CREDENTIAL',
      isSample: true,
      hasPrivateKey: true,
      certificatePem: expiredSmime.certPem,
      issuer: expiredInspection.issuer,
      subject: expiredInspection.subject,
    },
    {
      id: 'pgp-bob',
      ownerName: 'Bob Martinez',
      email: 'bob@pgp.local',
      type: 'OPENPGP_KEY',
      fingerprint: bobPgp.fingerprint,
      algorithm: bobPgp.algorithm,
      createdAt: bobPgp.createdAt,
      expiresAt: 'Never (Demonstration)',
      isTrusted: true,
      trustSource: 'Web of Trust (Full / Gateway Verified)',
      isSample: true,
      hasPrivateKey: true,
      publicKeyArmored: bobPgp.publicKey,
    },
    {
      id: 'pgp-charlie',
      ownerName: 'Charlie Evans',
      email: 'charlie@pgp.local',
      type: 'OPENPGP_KEY',
      fingerprint: charliePgp.fingerprint,
      algorithm: charliePgp.algorithm,
      createdAt: charliePgp.createdAt,
      expiresAt: 'Never (Demonstration)',
      isTrusted: true,
      trustSource: 'Web of Trust (Marginal)',
      isSample: true,
      hasPrivateKey: true,
      publicKeyArmored: charliePgp.publicKey,
    },
    {
      id: 'pgp-gateway',
      ownerName: 'Gateway Re-encryption Entity',
      email: 'gateway@mailsec.internal',
      type: 'OPENPGP_KEY',
      fingerprint: gatewayPgp.fingerprint,
      algorithm: gatewayPgp.algorithm,
      createdAt: gatewayPgp.createdAt,
      expiresAt: 'Never (Demonstration)',
      isTrusted: true,
      trustSource: 'Gateway Trusted Subkey',
      isSample: true,
      hasPrivateKey: true,
      publicKeyArmored: gatewayPgp.publicKey,
    },
  ];

  console.log('[Crypto] Demonstration cryptographic credentials ready.');
  return cachedCredentials;
}

export function getCredentialsInventory(): CredentialItem[] {
  return credentialsInventory;
}

export function addCredentialItem(item: CredentialItem): void {
  credentialsInventory.unshift(item);
}

export function removeCredentialItem(id: string): boolean {
  const index = credentialsInventory.findIndex(c => c.id === id);
  if (index !== -1) {
    credentialsInventory.splice(index, 1);
    return true;
  }
  return false;
}
