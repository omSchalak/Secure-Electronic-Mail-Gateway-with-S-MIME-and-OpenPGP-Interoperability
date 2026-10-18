import { Router, Request, Response } from 'express';
import { getAuditLogs, exportAuditLogsCSV } from '../data/auditStore.js';

export const auditRouter = Router();

// Get audit logs with query filters
auditRouter.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const { protocol, category, status, search } = req.query;
    const logs = getAuditLogs({
      protocol: protocol as string,
      category: category as string,
      status: status as string,
      search: search as string,
    });

    res.json({
      success: true,
      total: logs.length,
      data: logs,
      notice: 'Demonstration audit records. Sensitive fields (plaintext, private keys, passwords) are never logged or stored.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch audit logs' });
  }
});

// Export audit logs (CSV or JSON)
auditRouter.get('/audit-logs/export', (req: Request, res: Response) => {
  try {
    const { format } = req.query;
    if (format === 'csv') {
      const csv = exportAuditLogsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="gateway-audit-log.csv"');
      res.send(csv);
    } else {
      const logs = getAuditLogs();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="gateway-audit-log.json"');
      res.json(logs);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export audit logs' });
  }
});
