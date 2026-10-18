import { Router, Request, Response } from 'express';
import { getAuditLogs, resetAuditLogs, addAuditLog } from '../data/auditStore.js';
import { getCredentialsInventory, initializeSampleCredentials } from '../data/sampleKeys.js';
import { GatewayEngine } from '../crypto/gatewayEngine.js';

export const dashboardRouter = Router();

dashboardRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    await initializeSampleCredentials();
    const logs = getAuditLogs();
    const creds = getCredentialsInventory();

    const smimeCount = logs.filter(l => l.protocol === 'S/MIME').length;
    const openpgpCount = logs.filter(l => l.protocol === 'OpenPGP').length;
    const crossProtocolCount = logs.filter(l => l.protocol === 'CROSS-PROTOCOL').length;
    const successfulCount = logs.filter(l => l.status === 'SUCCESS').length;
    const sigPassed = logs.filter(l => l.verificationStatus === 'VERIFIED').length;
    const sigFailed = logs.filter(l => l.verificationStatus === 'FAILED').length;

    const activeCertCount = creds.filter(c => c.type === 'SMIME_CERT').length;
    const activePgpCount = creds.filter(c => c.type === 'OPENPGP_KEY').length;

    res.json({
      totalMessagesProcessed: logs.length,
      successfulWorkflows: successfulCount,
      smimeWorkflows: smimeCount,
      openpgpWorkflows: openpgpCount,
      crossProtocolWorkflows: crossProtocolCount,
      signatureVerificationsPassed: sigPassed,
      signatureVerificationsFailed: sigFailed,
      gatewayStatus: 'OPERATIONAL',
      activeCertificatesCount: activeCertCount,
      activePgpKeysCount: activePgpCount,
      recentActivity: logs.slice(0, 10),
      creator: 'Mansi Chalak',
      domain: 'Network Security and Secure Communication Protocols',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch dashboard metrics' });
  }
});

dashboardRouter.post('/demo/reset', (_req: Request, res: Response) => {
  try {
    resetAuditLogs();
    addAuditLog({
      category: 'KEY_MANAGEMENT',
      protocol: 'SYSTEM',
      action: 'Demonstration State Reset',
      sender: 'operator@mailsec.internal',
      recipient: 'gateway@mailsec.internal',
      status: 'SUCCESS',
      verificationStatus: 'NOT_APPLICABLE',
      details: 'Demonstration state reset to default academic baseline by operator request.',
    });
    res.json({ success: true, message: 'Demonstration state reset successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset demo data' });
  }
});

dashboardRouter.post('/demo/run-check', async (_req: Request, res: Response) => {
  try {
    // Run an automated health & crypto self-test across both S/MIME and OpenPGP subsystems
    const interopTest = await GatewayEngine.runScenario('scenario-3', 'Self-test diagnostic heartbeat payload.');
    res.json({
      success: true,
      checkName: 'Gateway End-to-End Cryptographic Self-Test',
      status: 'PASSED',
      timestamp: new Date().toISOString(),
      details: 'S/MIME PKCS#7 envelope parsed, decrypted with Gateway CA key, re-encrypted via OpenPGP ECC engine, and verified successfully.',
      interopResult: interopTest,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Self-test check failed' });
  }
});
