import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  KeyRound,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { CredentialItem } from '../types/index';

export const CredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SMIME_CERT' | 'OPENPGP_KEY'>('ALL');
  const [showImportModal, setShowImportModal] = useState(false);

  // Import form state
  const [importText, setImportText] = useState('');
  const [importOwner, setImportOwner] = useState('');
  const [importEmail, setImportEmail] = useState('');
  const [importType, setImportType] = useState<'SMIME' | 'OPENPGP'>('SMIME');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getCredentials();
      setCredentials(res.data);
    } catch (err: any) {
      console.error('Failed to load credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove credential "${name}" from gateway truststore?`)) {
      try {
        await ApiService.deleteCredential(id);
        fetchCredentials();
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      setImportError('Please paste a certificate PEM or OpenPGP public key block');
      return;
    }

    setImportLoading(true);
    setImportError(null);
    try {
      await ApiService.importCredential({
        rawText: importText,
        ownerName: importOwner,
        email: importEmail,
        type: importType,
      });
      setShowImportModal(false);
      setImportText('');
      setImportOwner('');
      setImportEmail('');
      fetchCredentials();
    } catch (err: any) {
      setImportError(err.message || 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const filtered = credentials.filter((c) => {
    const matchesType = filterType === 'ALL' || c.type === filterType;
    const matchesSearch =
      c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.fingerprint.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[#202020] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-2">
            <Key size={13} /> Truststore & Keyring Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
            Certificate & Key Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            Manage demonstration X.509 S/MIME certificates, OpenPGP public keys, fingerprints, and recipient compatibility.
          </p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="brutal-btn-primary px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} /> Import Certificate / Public Key
        </button>
      </div>

      {/* Recipient-to-Protocol Compatibility Matrix Banner */}
      <div className="bg-[#FFFFFF] border-3 border-[#202020] p-5 shadow-brutal">
        <h3 className="font-black text-sm uppercase text-[#202020] mb-2 flex items-center gap-2">
          <Shield size={16} className="text-[#FF6B00]" /> Recipient-to-Protocol Compatibility Matrix
        </h3>
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          The gateway inspects incoming recipient addresses to determine the matching cryptographic standard. When a sender dispatches via a different protocol, the gateway engages its decrypt-and-re-encrypt engine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-2.5 bg-[#FFFAF5] border border-[#FFE0CC]">
            <span className="font-bold text-[#FF6B00]">@smime.local addresses</span>
            <div className="text-[11px] text-gray-600 mt-0.5">Matched to S/MIME X.509 PKCS#7</div>
          </div>
          <div className="p-2.5 bg-[#FFFAF5] border border-[#FFE0CC]">
            <span className="font-bold text-[#D94B00]">@pgp.local addresses</span>
            <div className="text-[11px] text-gray-600 mt-0.5">Matched to OpenPGP RFC 4880 Keyring</div>
          </div>
          <div className="p-2.5 bg-[#202020] text-white border border-[#202020]">
            <span className="font-bold text-[#FF8533]">gateway@mailsec.internal</span>
            <div className="text-[11px] text-gray-300 mt-0.5">Dual-homed Gateway Interop Node</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credentials by name, email, fingerprint..."
            className="w-full pl-9 pr-3 py-2 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="flex items-center gap-1 border-2 border-[#202020] bg-white p-1 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 text-xs font-bold ${
              filterType === 'ALL' ? 'bg-[#FF6B00] text-white' : 'text-gray-700'
            }`}
          >
            All ({credentials.length})
          </button>
          <button
            onClick={() => setFilterType('SMIME_CERT')}
            className={`px-3 py-1 text-xs font-bold ${
              filterType === 'SMIME_CERT' ? 'bg-[#202020] text-white' : 'text-gray-700'
            }`}
          >
            S/MIME Certs
          </button>
          <button
            onClick={() => setFilterType('OPENPGP_KEY')}
            className={`px-3 py-1 text-xs font-bold ${
              filterType === 'OPENPGP_KEY' ? 'bg-[#D94B00] text-white' : 'text-gray-700'
            }`}
          >
            OpenPGP Keys
          </button>
        </div>
      </div>

      {/* Credentials Inventory Table */}
      <div className="bg-white border-3 border-[#202020] shadow-brutal-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-gray-500">
            Loading credentials inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-gray-500">
            No matching credentials found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#202020] text-white font-mono uppercase">
                  <th className="p-3 border border-gray-700">Type</th>
                  <th className="p-3 border border-gray-700">Owner & Email</th>
                  <th className="p-3 border border-gray-700">Algorithm</th>
                  <th className="p-3 border border-gray-700">Fingerprint</th>
                  <th className="p-3 border border-gray-700">Trust Status</th>
                  <th className="p-3 border border-gray-700">Expires</th>
                  <th className="p-3 border border-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFF0E5]/50 transition-colors">
                    {/* Type Badge */}
                    <td className="p-3 border border-gray-200">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border ${
                          item.type === 'SMIME_CERT'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-orange-50 text-[#D94B00] border-orange-300'
                        }`}
                      >
                        {item.type === 'SMIME_CERT' ? <Lock size={10} /> : <KeyRound size={10} />}
                        {item.type === 'SMIME_CERT' ? 'S/MIME' : 'OpenPGP'}
                      </span>
                    </td>

                    {/* Owner & Email */}
                    <td className="p-3 border border-gray-200 font-sans">
                      <div className="font-bold text-[#202020]">{item.ownerName}</div>
                      <div className="text-[11px] font-mono text-gray-500">{item.email}</div>
                      {item.isSample && (
                        <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1 py-0.2 border border-gray-300">
                          Sample Preset
                        </span>
                      )}
                    </td>

                    {/* Algorithm */}
                    <td className="p-3 border border-gray-200 text-gray-700">
                      {item.algorithm}
                    </td>

                    {/* Fingerprint */}
                    <td className="p-3 border border-gray-200">
                      <span className="text-[10px] text-[#FF6B00] font-bold break-all">
                        {item.fingerprint.slice(0, 24)}...
                      </span>
                    </td>

                    {/* Trust Status */}
                    <td className="p-3 border border-gray-200">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                          item.isTrusted
                            ? 'bg-green-100 text-green-900 border-green-600'
                            : 'bg-yellow-100 text-yellow-900 border-yellow-500'
                        }`}
                      >
                        {item.trustSource}
                      </span>
                    </td>

                    {/* Expiration */}
                    <td className="p-3 border border-gray-200 text-gray-600">
                      {item.expiresAt.includes('Never')
                        ? 'Never'
                        : new Date(item.expiresAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="p-3 border border-gray-200 text-right">
                      {!item.isSample && (
                        <button
                          onClick={() => handleDelete(item.id, item.ownerName)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove Credential"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#202020] max-w-lg w-full p-6 shadow-brutal-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <h3 className="font-black text-sm uppercase text-[#202020]">
                Import Certificate or OpenPGP Key
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Credential Standard
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportType('SMIME')}
                    className={`p-2 text-xs font-bold border-2 ${
                      importType === 'SMIME'
                        ? 'bg-[#FF6B00] text-white border-[#202020]'
                        : 'bg-white border-[#202020]'
                    }`}
                  >
                    S/MIME X.509 Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportType('OPENPGP')}
                    className={`p-2 text-xs font-bold border-2 ${
                      importType === 'OPENPGP'
                        ? 'bg-[#FF6B00] text-white border-[#202020]'
                        : 'bg-white border-[#202020]'
                    }`}
                  >
                    OpenPGP Public Key
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Owner Name (Optional):
                </label>
                <input
                  type="text"
                  value={importOwner}
                  onChange={(e) => setImportOwner(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-2 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Email Address (Optional):
                </label>
                <input
                  type="email"
                  value={importEmail}
                  onChange={(e) => setImportEmail(e.target.value)}
                  placeholder="e.g. john@enterprise.local"
                  className="w-full p-2 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Armored Key / Certificate PEM Block *
                </label>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={
                    importType === 'SMIME'
                      ? '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'
                      : '-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----'
                  }
                  required
                  className="w-full p-2 text-[11px] font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {importError && (
                <p className="text-xs font-mono text-red-600 flex items-center gap-1">
                  <AlertTriangle size={13} /> {importError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-bold border-2 border-[#202020] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="brutal-btn-primary px-5 py-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {importLoading ? 'Validating...' : 'Import into Gateway Truststore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
