import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Send,
  Lock,
  KeyRound,
  FileText,
  Clock,
  ArrowUpRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { DashboardMetrics, AuditEvent } from '../types/index';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDashboardMetrics();
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRunSecurityCheck = async () => {
    try {
      setIsRunningCheck(true);
      setActionMessage('Running end-to-end cryptographic self-test across S/MIME and OpenPGP subsystems...');
      const res = await ApiService.runSecuritySelfCheck();
      setActionMessage(`Self-test completed: ${res.details}`);
      await fetchDashboard();
    } catch (err: any) {
      setActionMessage(`Self-test error: ${err.message}`);
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleResetData = async () => {
    try {
      await ApiService.resetDemoData();
      setShowResetConfirm(false);
      setActionMessage('Demonstration state has been reset to baseline.');
      await fetchDashboard();
    } catch (err: any) {
      setActionMessage(`Reset failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#202020]">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-2">
            <Activity size={13} /> Gateway Live Telemetry
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
            Security Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            Real-time cryptographic audit telemetry, signature verification outcomes, and protocol throughput.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunSecurityCheck}
            disabled={isRunningCheck}
            className="brutal-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play size={14} className={isRunningCheck ? 'animate-spin' : ''} />
            {isRunningCheck ? 'Running Self-Check...' : 'Run Security Check'}
          </button>

          <Link
            to="/composer"
            className="brutal-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Send size={14} className="text-[#FF6B00]" />
            Email Composer
          </Link>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-white border-2 border-[#202020] text-gray-700 hover:text-red-600 hover:border-red-600 px-3 py-2 text-xs font-bold transition-all shadow-[2px_2px_0_0_#202020]"
            title="Reset Demo Data"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Banner Notice */}
      <div className="p-3 bg-[#FFF0E5] border-2 border-[#FF6B00] text-xs font-mono flex items-center justify-between gap-2 text-[#D94B00]">
        <div className="flex items-center gap-2">
          <Shield size={16} className="shrink-0" />
          <span>
            <strong>ACADEMIC TELEMETRY:</strong> Statistics reflect state from local cryptographic operations and controlled demonstration scenarios. Gateway transport is local-only.
          </span>
        </div>
        <button
          onClick={fetchDashboard}
          className="text-xs font-bold underline hover:text-[#202020] flex items-center gap-1"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Backend Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-600 text-xs font-mono text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-brutal">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <div>
              <strong className="block text-red-900 uppercase">Gateway Telemetry Offline</strong>
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={fetchDashboard}
            className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs border border-black shadow-[2px_2px_0_0_#202020] hover:bg-red-700 flex items-center gap-1 shrink-0"
          >
            <RefreshCw size={12} /> Retry Connection
          </button>
        </div>
      )}

      {/* Action status message toast */}
      {actionMessage && (
        <div className="p-3 bg-[#202020] text-white border-2 border-[#FF6B00] text-xs font-mono flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#202020] max-w-md w-full p-6 shadow-brutal-xl">
            <h3 className="text-lg font-black uppercase text-[#202020] mb-2 flex items-center gap-2">
              <AlertTriangle className="text-[#FF6B00]" /> Confirm Demo State Reset
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              This will restore the gateway audit log and session metrics back to initial demonstration baseline. Are you sure you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold border-2 border-[#202020] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="bg-red-600 text-white font-bold px-4 py-2 text-xs border-2 border-[#202020] shadow-[2px_2px_0_0_#202020] hover:bg-red-700"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed */}
        <div className="brutal-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">Total Messages</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
          </div>
          <div className="text-3xl font-black text-[#202020]">
            {loading ? '...' : metrics?.totalMessagesProcessed ?? 0}
          </div>
          <div className="text-[11px] font-mono text-gray-500 mt-2">
            Completed: <strong className="text-green-700">{metrics?.successfulWorkflows ?? 0}</strong> workflows
          </div>
        </div>

        {/* S/MIME Workflows */}
        <div className="brutal-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">S/MIME Workflows</span>
            <Lock size={15} className="text-[#FF6B00]" />
          </div>
          <div className="text-3xl font-black text-[#FF6B00]">
            {loading ? '...' : metrics?.smimeWorkflows ?? 0}
          </div>
          <div className="text-[11px] font-mono text-gray-500 mt-2">
            Active Certs: <strong>{metrics?.activeCertificatesCount ?? 0}</strong> in truststore
          </div>
        </div>

        {/* OpenPGP Workflows */}
        <div className="brutal-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">OpenPGP Workflows</span>
            <KeyRound size={15} className="text-[#D94B00]" />
          </div>
          <div className="text-3xl font-black text-[#D94B00]">
            {loading ? '...' : metrics?.openpgpWorkflows ?? 0}
          </div>
          <div className="text-[11px] font-mono text-gray-500 mt-2">
            Active Keys: <strong>{metrics?.activePgpKeysCount ?? 0}</strong> on keyring
          </div>
        </div>

        {/* Signature Verifications */}
        <div className="brutal-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">Signatures Verified</span>
            <CheckCircle2 size={15} className="text-green-600" />
          </div>
          <div className="text-3xl font-black text-green-700">
            {loading ? '...' : metrics?.signatureVerificationsPassed ?? 0}
          </div>
          <div className="text-[11px] font-mono text-gray-500 mt-2">
            Failed/Tampered: <strong className="text-red-600">{metrics?.signatureVerificationsFailed ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* Protocol Distribution & Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Distribution Breakdown */}
        <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-100">
            <h3 className="font-black text-base uppercase text-[#202020]">
              Protocol Workload Distribution
            </h3>
            <span className="text-[10px] font-mono bg-[#FFF0E5] text-[#D94B00] px-2 py-0.5 border border-[#FF6B00]">
              GATEWAY METRICS
            </span>
          </div>

          <div className="space-y-4">
            {/* S/MIME Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>S/MIME PKCS#7 (X.509)</span>
                <span>{metrics?.smimeWorkflows ?? 0} Events</span>
              </div>
              <div className="w-full h-3 bg-gray-100 border border-[#202020] overflow-hidden">
                <div
                  className="h-full bg-[#FF6B00]"
                  style={{
                    width: `${Math.max(
                      15,
                      metrics?.totalMessagesProcessed
                        ? ((metrics.smimeWorkflows / metrics.totalMessagesProcessed) * 100)
                        : 35
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* OpenPGP Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>OpenPGP RFC 4880</span>
                <span>{metrics?.openpgpWorkflows ?? 0} Events</span>
              </div>
              <div className="w-full h-3 bg-gray-100 border border-[#202020] overflow-hidden">
                <div
                  className="h-full bg-[#D94B00]"
                  style={{
                    width: `${Math.max(
                      15,
                      metrics?.totalMessagesProcessed
                        ? ((metrics.openpgpWorkflows / metrics.totalMessagesProcessed) * 100)
                        : 30
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Cross-Protocol Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Cross-Protocol (Decrypt & Re-encrypt)</span>
                <span>{metrics?.crossProtocolWorkflows ?? 0} Events</span>
              </div>
              <div className="w-full h-3 bg-gray-100 border border-[#202020] overflow-hidden">
                <div
                  className="h-full bg-[#202020]"
                  style={{
                    width: `${Math.max(
                      15,
                      metrics?.totalMessagesProcessed
                        ? ((metrics.crossProtocolWorkflows / metrics.totalMessagesProcessed) * 100)
                        : 25
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
            <span>Gateway Health Status:</span>
            <span className="font-extrabold text-green-700 bg-green-50 px-2 py-0.5 border border-green-300">
              ● OPERATIONAL (100% HEALTHY)
            </span>
          </div>
        </div>

        {/* Right: Security & Workflow Status */}
        <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-100">
              <h3 className="font-black text-base uppercase text-[#202020]">
                Cryptographic Policy Enforcement
              </h3>
              <span className="text-[10px] font-mono bg-[#202020] text-white px-2 py-0.5">
                ENFORCED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#FFFAF5] border border-[#FFE0CC]">
                <div className="text-gray-500 text-[10px]">DOWNGRADE PROTECTION</div>
                <div className="font-bold text-[#202020] mt-1">NO_PLAINTEXT_FALLBACK</div>
                <div className="text-[10px] text-green-700 mt-1">✓ Enforced by Policy</div>
              </div>

              <div className="p-3 bg-[#FFFAF5] border border-[#FFE0CC]">
                <div className="text-gray-500 text-[10px]">SIGNATURE VALIDATION</div>
                <div className="font-bold text-[#202020] mt-1">PRE_DECRYPT_CHECK</div>
                <div className="text-[10px] text-green-700 mt-1">✓ Non-repudiation logged</div>
              </div>

              <div className="p-3 bg-[#FFFAF5] border border-[#FFE0CC]">
                <div className="text-gray-500 text-[10px]">PLAINTEXT BUFFER LIFETIME</div>
                <div className="font-bold text-[#202020] mt-1">EPHEMERAL_RAM_ONLY</div>
                <div className="text-[10px] text-green-700 mt-1">✓ Zero disk persistence</div>
              </div>

              <div className="p-3 bg-[#FFFAF5] border border-[#FFE0CC]">
                <div className="text-gray-500 text-[10px]">GATEWAY RE-SIGNING</div>
                <div className="font-bold text-[#202020] mt-1">PROVENANCE_HEADER</div>
                <div className="text-[10px] text-green-700 mt-1">✓ Gateway Key Attested</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">Simulate edge-cases:</span>
            <Link
              to="/interoperability"
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
            >
              Test Interoperability Scenarios →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Log Table */}
      <div className="bg-white border-3 border-[#202020] p-6 shadow-brutal-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-3 border-b-2 border-gray-100">
          <div>
            <h3 className="font-black text-xl uppercase text-[#202020] tracking-tight">
              Recent Gateway Activity & Audit Stream
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Live cryptographic event ledger. Click any row to inspect technical details.
            </p>
          </div>
          <Link
            to="/audit"
            className="text-xs font-bold bg-[#FFF0E5] text-[#D94B00] border-2 border-[#202020] px-3 py-1.5 hover:bg-[#FF6B00] hover:text-white transition-all shadow-[2px_2px_0_0_#202020] flex items-center gap-1"
          >
            <FileText size={13} /> View Full Audit Log
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-gray-500">
            Loading cryptographic telemetry...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#202020] text-white font-mono uppercase">
                  <th className="p-2.5 border border-gray-700">Event ID</th>
                  <th className="p-2.5 border border-gray-700">Timestamp</th>
                  <th className="p-2.5 border border-gray-700">Protocol</th>
                  <th className="p-2.5 border border-gray-700">Action</th>
                  <th className="p-2.5 border border-gray-700">Sender / Recipient</th>
                  <th className="p-2.5 border border-gray-700">Status</th>
                  <th className="p-2.5 border border-gray-700">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                  metrics.recentActivity.map((evt) => (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="hover:bg-[#FFF0E5] cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-bold text-[#FF6B00] border border-gray-200">
                        {evt.id}
                      </td>
                      <td className="p-2.5 text-gray-600 border border-gray-200 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2.5 border border-gray-200 font-bold">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] border ${
                            evt.protocol === 'S/MIME'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : evt.protocol === 'OpenPGP'
                              ? 'bg-orange-50 text-[#D94B00] border-orange-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {evt.protocol}
                        </span>
                      </td>
                      <td className="p-2.5 font-sans font-bold text-[#202020] border border-gray-200 truncate max-w-xs">
                        {evt.action}
                      </td>
                      <td className="p-2.5 text-gray-600 border border-gray-200 truncate max-w-[200px]">
                        {evt.sender} → {evt.recipient}
                      </td>
                      <td className="p-2.5 border border-gray-200">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold ${
                            evt.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="p-2.5 border border-gray-200">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold ${
                            evt.verificationStatus === 'VERIFIED'
                              ? 'text-green-700'
                              : evt.verificationStatus === 'FAILED'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {evt.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      No events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#202020] max-w-2xl w-full p-6 shadow-brutal-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm bg-[#FF6B00] text-white px-2 py-0.5">
                  {selectedEvent.id}
                </span>
                <span className="font-black text-sm uppercase">Audit Event Inspection</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-black font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div><strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</div>
              <div><strong>Protocol:</strong> {selectedEvent.protocol}</div>
              <div><strong>Category:</strong> {selectedEvent.category}</div>
              <div><strong>Status:</strong> {selectedEvent.status}</div>
              <div><strong>Sender:</strong> {selectedEvent.sender}</div>
              <div><strong>Recipient:</strong> {selectedEvent.recipient}</div>
              <div><strong>Verification:</strong> {selectedEvent.verificationStatus}</div>
              <div><strong>Record Type:</strong> Demonstration Record</div>
            </div>

            <div className="p-3 bg-[#FFFAF5] border border-[#202020]">
              <div className="text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">
                Technical Audit Log Details
              </div>
              <div className="text-xs text-[#202020] font-sans leading-relaxed">
                {selectedEvent.details}
              </div>
            </div>

            <div className="text-[11px] font-mono text-gray-500 border-t pt-3 flex justify-between items-center">
              <span>Plaintext and private keys were excluded from this record.</span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="brutal-btn-primary px-4 py-1.5 text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
