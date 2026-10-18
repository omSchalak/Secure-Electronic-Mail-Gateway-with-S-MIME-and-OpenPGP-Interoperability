export type ProtocolType = 'SMIME' | 'OPENPGP' | 'AUTO';

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: 'CRYPTOGRAPHIC_OPERATION' | 'GATEWAY_INTEROP' | 'KEY_MANAGEMENT' | 'POLICY_ENFORCEMENT' | 'SECURITY_ALERT';
  protocol: 'S/MIME' | 'OpenPGP' | 'CROSS-PROTOCOL' | 'SYSTEM';
  action: string;
  sender: string;
  recipient: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  verificationStatus: 'VERIFIED' | 'FAILED' | 'UNVERIFIED' | 'NOT_APPLICABLE';
  details: string;
  metadata?: Record<string, any>;
  isDemoRecord: boolean;
}

export interface CredentialItem {
  id: string;
  ownerName: string;
  email: string;
  type: 'SMIME_CERT' | 'OPENPGP_KEY';
  fingerprint: string;
  algorithm: string;
  keySize?: number | string;
  createdAt: string;
  expiresAt: string;
  isTrusted: boolean;
  trustSource: string;
  isSample: boolean;
  hasPrivateKey: boolean;
  publicKeyArmored?: string;
  certificatePem?: string;
  issuer?: string;
  subject?: string;
}

export interface GatewayProcessStep {
  stepNumber: number;
  name: string;
  status: 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'WARNING';
  description: string;
  technicalDetails: string;
  timestamp: string;
}

export interface GatewayInteropResult {
  scenarioId: string;
  scenarioName: string;
  senderProtocol: 'S/MIME' | 'OpenPGP';
  recipientProtocol: 'S/MIME' | 'OpenPGP';
  decision: 'DIRECT_ROUTING' | 'CONTROLLED_TRANSFORMATION' | 'REJECT_POLICY' | 'REJECT_SIGNATURE';
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  steps: GatewayProcessStep[];
  incomingProtection: {
    encrypted: boolean;
    signed: boolean;
    format: string;
    senderKeyFingerprint?: string;
  };
  verificationOutcome: {
    signatureValid: boolean;
    trustChainEstablished: boolean;
    details: string;
  };
  transformationDetails?: {
    decryptedByGateway: boolean;
    gatewayIdentity: string;
    reEncryptedForRecipient: boolean;
    reSignedByGateway: boolean;
    plaintextBoundaryNotice: string;
  };
  finalOutput: {
    deliveredFormat: string;
    payloadPreview: string;
    recipientNotified: boolean;
  };
  auditLogId: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalMessagesProcessed: number;
  successfulWorkflows: number;
  smimeWorkflows: number;
  openpgpWorkflows: number;
  crossProtocolWorkflows: number;
  signatureVerificationsPassed: number;
  signatureVerificationsFailed: number;
  gatewayStatus: 'HEALTHY' | 'DEGRADED' | 'OPERATIONAL';
  activeCertificatesCount: number;
  activePgpKeysCount: number;
  recentActivity: AuditEvent[];
}
