import { AuditEvent } from '../types/index.js';

let auditLogs: AuditEvent[] = [
  {
    id: 'EVT-8921-A',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    category: 'GATEWAY_INTEROP',
    protocol: 'CROSS-PROTOCOL',
    action: 'Interoperability Transform: S/MIME -> OpenPGP',
    sender: 'alice@smime.local',
    recipient: 'bob@pgp.local',
    status: 'SUCCESS',
    verificationStatus: 'VERIFIED',
    details: 'Incoming PKCS#7 envelope verified. Gateway decrypted with internal cert, re-encrypted with Bob OpenPGP key [ECC-256]. Gateway signature appended.',
    isDemoRecord: true,
  },
  {
    id: 'EVT-8920-B',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    category: 'CRYPTOGRAPHIC_OPERATION',
    protocol: 'S/MIME',
    action: 'PKCS#7 EnvelopedData Ingestion',
    sender: 'alice@smime.local',
    recipient: 'david@smime.local',
    status: 'SUCCESS',
    verificationStatus: 'NOT_APPLICABLE',
    details: 'Direct routing without protocol transformation. Recipient certificate matches S/MIME domain policy.',
    isDemoRecord: true,
  },
  {
    id: 'EVT-8919-C',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    category: 'POLICY_ENFORCEMENT',
    protocol: 'CROSS-PROTOCOL',
    action: 'Halt on Missing Recipient Public Key',
    sender: 'david@smime.local',
    recipient: 'unknown@external.net',
    status: 'FAILED',
    verificationStatus: 'UNVERIFIED',
    details: 'Policy enforcement blocked message dispatch. Neither X.509 certificate nor OpenPGP public key discovered for recipient address.',
    isDemoRecord: true,
  },
  {
    id: 'EVT-8918-D',
    timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    category: 'SECURITY_ALERT',
    protocol: 'OpenPGP',
    action: 'Tamper Detection: Corrupted Signature Packet',
    sender: 'attacker@spoofed.org',
    recipient: 'bob@pgp.local',
    status: 'FAILED',
    verificationStatus: 'FAILED',
    details: 'Digital signature digest mismatch detected on packet 0x02. Message dropped before gateway plaintext boundary.',
    isDemoRecord: true,
  },
  {
    id: 'EVT-8917-E',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    category: 'KEY_MANAGEMENT',
    protocol: 'SYSTEM',
    action: 'Gateway Identity Key Rotation Check',
    sender: 'system@mailsec.internal',
    recipient: 'gateway@mailsec.internal',
    status: 'SUCCESS',
    verificationStatus: 'VERIFIED',
    details: 'Verified validity of Gateway S/MIME Root (expires 2031) and OpenPGP Subkey. Next audit scheduled in 30 days.',
    isDemoRecord: true,
  },
];

export function addAuditLog(log: Omit<AuditEvent, 'id' | 'timestamp' | 'isDemoRecord'>): AuditEvent {
  const newLog: AuditEvent = {
    ...log,
    id: `EVT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase().slice(-3)}`,
    timestamp: new Date().toISOString(),
    isDemoRecord: true,
  };
  auditLogs.unshift(newLog);
  // Keep last 200 logs
  if (auditLogs.length > 200) {
    auditLogs.pop();
  }
  return newLog;
}

export function getAuditLogs(filters?: {
  protocol?: string;
  category?: string;
  status?: string;
  search?: string;
}): AuditEvent[] {
  let filtered = [...auditLogs];

  if (filters?.protocol && filters.protocol !== 'ALL') {
    filtered = filtered.filter(l => l.protocol.toLowerCase() === filters.protocol?.toLowerCase());
  }
  if (filters?.category && filters.category !== 'ALL') {
    filtered = filtered.filter(l => l.category.toLowerCase() === filters.category?.toLowerCase());
  }
  if (filters?.status && filters.status !== 'ALL') {
    filtered = filtered.filter(l => l.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      l =>
        l.id.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.sender.toLowerCase().includes(q) ||
        l.recipient.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export function resetAuditLogs(): void {
  auditLogs = auditLogs.slice(0, 5); // Keep initial demonstration seed
}

export function exportAuditLogsCSV(): string {
  const headers = ['Event ID', 'Timestamp', 'Category', 'Protocol', 'Action', 'Sender', 'Recipient', 'Status', 'Verification', 'Details'];
  const rows = auditLogs.map(l => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.category}"`,
    `"${l.protocol}"`,
    `"${l.action.replace(/"/g, '""')}"`,
    `"${l.sender}"`,
    `"${l.recipient}"`,
    `"${l.status}"`,
    `"${l.verificationStatus}"`,
    `"${l.details.replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
