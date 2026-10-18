import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { AuditEvent } from '../types/index';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAuditLogs({
        protocol: protocolFilter !== 'ALL' ? protocolFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() !== '' ? search : undefined,
      });
      setLogs(res.data);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [protocolFilter, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`${ApiService.getBaseUrl()}/audit-logs/export?format=${format}`, '_blank');
  };

  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[#202020] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-2">
            <FileText size={13} /> Tamper-Evident Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
            Cryptographic Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            Searchable, exportable record of cryptographic operations, gateway interoperability transitions, and security policy verdicts.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="brutal-btn-secondary px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="brutal-btn-primary px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={13} /> Export JSON
          </button>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 bg-[#202020] text-white border-3 border-[#FF6B00] text-xs font-mono space-y-1">
        <div className="flex items-center gap-2 text-[#FF8533] font-bold">
          <ShieldAlert size={16} /> AUDIT REDACTION POLICY & DEMO RECORD NOTICE
        </div>
        <p className="text-gray-300 leading-relaxed font-sans">
          To comply with cybersecurity best practices and zero-trust principles, this gateway strictly forbids logging plaintext email contents, passphrases, or private keys. All records shown are labeled demonstration events generated during local execution.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-3 border-[#202020] p-4 shadow-brutal space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event ID, sender, recipient, or action..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <button type="submit" className="brutal-btn-primary px-4 py-2 text-xs shrink-0 cursor-pointer">
            Filter Ledger
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-gray-100">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Protocol</label>
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="w-full p-1.5 border border-[#202020] bg-white font-mono text-xs"
            >
              <option value="ALL">All Protocols</option>
              <option value="S/MIME">S/MIME</option>
              <option value="OpenPGP">OpenPGP</option>
              <option value="CROSS-PROTOCOL">Cross-Protocol</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-1.5 border border-[#202020] bg-white font-mono text-xs"
            >
              <option value="ALL">All Categories</option>
              <option value="GATEWAY_INTEROP">Gateway Interop</option>
              <option value="CRYPTOGRAPHIC_OPERATION">Cryptographic Op</option>
              <option value="POLICY_ENFORCEMENT">Policy Enforcement</option>
              <option value="SECURITY_ALERT">Security Alert</option>
              <option value="KEY_MANAGEMENT">Key Management</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 border border-[#202020] bg-white font-mono text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Sort Time</label>
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              className="w-full p-1.5 border border-[#202020] bg-gray-50 text-xs font-bold text-left"
            >
              {sortAsc ? '▲ Oldest First' : '▼ Newest First'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border-3 border-[#202020] shadow-brutal-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-gray-500">
            Filtering audit events...
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-gray-500">
            No audit records match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#202020] text-white font-mono uppercase">
                  <th className="p-3 border border-gray-700">Event ID</th>
                  <th className="p-3 border border-gray-700">Timestamp</th>
                  <th className="p-3 border border-gray-700">Category</th>
                  <th className="p-3 border border-gray-700">Protocol</th>
                  <th className="p-3 border border-gray-700">Action</th>
                  <th className="p-3 border border-gray-700">Participants</th>
                  <th className="p-3 border border-gray-700">Status</th>
                  <th className="p-3 border border-gray-700">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {sortedLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-[#FFF0E5] cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-[#FF6B00] border border-gray-200">
                      {log.id}
                    </td>
                    <td className="p-3 text-gray-600 border border-gray-200 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-gray-700 border border-gray-200 text-[10px]">
                      {log.category}
                    </td>
                    <td className="p-3 border border-gray-200 font-bold">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] border ${
                          log.protocol === 'S/MIME'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : log.protocol === 'OpenPGP'
                            ? 'bg-orange-50 text-[#D94B00] border-orange-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {log.protocol}
                      </span>
                    </td>
                    <td className="p-3 font-sans font-bold text-[#202020] border border-gray-200 truncate max-w-xs">
                      {log.action}
                    </td>
                    <td className="p-3 text-gray-600 border border-gray-200 truncate max-w-[200px]">
                      {log.sender} → {log.recipient}
                    </td>
                    <td className="p-3 border border-gray-200">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-900 border border-green-600'
                            : 'bg-red-100 text-red-900 border border-red-600'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 border border-gray-200">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold ${
                          log.verificationStatus === 'VERIFIED'
                            ? 'text-green-700'
                            : log.verificationStatus === 'FAILED'
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {log.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Modal for Selected Log */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#202020] max-w-2xl w-full p-6 shadow-brutal-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm bg-[#FF6B00] text-white px-2 py-0.5">
                  {selectedLog.id}
                </span>
                <span className="font-black text-sm uppercase">Detailed Audit Record</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</div>
              <div><strong>Protocol:</strong> {selectedLog.protocol}</div>
              <div><strong>Category:</strong> {selectedLog.category}</div>
              <div><strong>Status:</strong> {selectedLog.status}</div>
              <div><strong>Sender:</strong> {selectedLog.sender}</div>
              <div><strong>Recipient:</strong> {selectedLog.recipient}</div>
              <div><strong>Verification:</strong> {selectedLog.verificationStatus}</div>
              <div><strong>Demonstration Record:</strong> YES</div>
            </div>

            <div className="p-3 bg-[#FFFAF5] border border-[#202020]">
              <div className="text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">
                Cryptographic Action Description
              </div>
              <div className="text-xs text-[#202020] font-sans leading-relaxed">
                {selectedLog.details}
              </div>
            </div>

            <div className="text-[11px] font-mono text-gray-500 border-t pt-3 flex justify-between items-center">
              <span>Zero-knowledge redaction applied.</span>
              <button
                onClick={() => setSelectedLog(null)}
                className="brutal-btn-primary px-4 py-1.5 text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
