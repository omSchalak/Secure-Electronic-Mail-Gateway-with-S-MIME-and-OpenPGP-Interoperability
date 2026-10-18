import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  FileCheck2,
  Copy,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Fingerprint,
  Terminal,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { PgpKeyInspectionResult } from '../types/index';

export const OpenPgpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'ENCRYPT_DECRYPT' | 'SIGN_VERIFY' | 'INSPECT'>('GENERATE');

  // KeyGen state
  const [genName, setGenName] = useState('Elena Rostova');
  const [genEmail, setGenEmail] = useState('elena@pgp.local');
  const [genPassphrase, setGenPassphrase] = useState('');
  const [genType, setGenType] = useState<'ecc' | 'rsa'>('ecc');
  const [generatedKey, setGeneratedKey] = useState<any | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Encrypt / Decrypt state
  const [encPlaintext, setEncPlaintext] = useState('Secret OpenPGP communication for Bob Martinez.');
  const [encryptedOutput, setEncryptedOutput] = useState<string | null>(null);
  const [decryptedPlaintext, setDecryptedPlaintext] = useState<string | null>(null);
  const [encLoading, setEncLoading] = useState(false);

  // Sign / Verify state
  const [signMessage, setSignMessage] = useState('Authenticated statement signed by Bob Martinez.');
  const [signedCleartext, setSignedCleartext] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [signLoading, setSignLoading] = useState(false);

  // Inspect state
  const [inspectInput, setInspectInput] = useState('');
  const [inspection, setInspection] = useState<PgpKeyInspectionResult | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const [copiedKey, setCopiedKey] = useState(false);

  // Load sample Bob key into inspector on startup
  useEffect(() => {
    loadSampleBobKey();
  }, []);

  const loadSampleBobKey = async () => {
    try {
      const sample = await ApiService.getOpenPGPSampleCredentials();
      if (sample?.bob?.publicKey) {
        setInspectInput(sample.bob.publicKey);
        const res = await ApiService.inspectOpenPGPKey(sample.bob.publicKey);
        setInspection(res.data);
      }
    } catch (err: any) {
      console.warn('Could not load sample Bob key:', err.message);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await ApiService.generateOpenPGPKey(genName, genEmail, genPassphrase, genType);
      setGeneratedKey(res.data);
      setShowPrivateKey(false);
    } catch (err: any) {
      alert(`Key generation failed: ${err.message}`);
    } finally {
      setGenLoading(false);
    }
  };

  const handleEncrypt = async () => {
    setEncLoading(true);
    try {
      const res = await ApiService.encryptOpenPGP(encPlaintext, undefined, undefined, undefined, true);
      setEncryptedOutput(res.data.ciphertext);
      setDecryptedPlaintext(null);
    } catch (err: any) {
      alert(`Encryption failed: ${err.message}`);
    } finally {
      setEncLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedOutput) return;
    setEncLoading(true);
    try {
      const res = await ApiService.decryptOpenPGP(encryptedOutput, undefined, undefined, undefined, true);
      setDecryptedPlaintext(res.data.plaintext);
    } catch (err: any) {
      alert(`Decryption failed: ${err.message}`);
    } finally {
      setEncLoading(false);
    }
  };

  const handleSign = async () => {
    setSignLoading(true);
    try {
      const res = await ApiService.signOpenPGP(signMessage, undefined, undefined, false, true);
      setSignedCleartext(res.data.cleartextSigned);
      setVerifyResult(null);
    } catch (err: any) {
      alert(`Signing failed: ${err.message}`);
    } finally {
      setSignLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signedCleartext) return;
    setSignLoading(true);
    try {
      const res = await ApiService.verifyOpenPGP(signedCleartext, undefined, undefined, true);
      setVerifyResult(res.data);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setSignLoading(false);
    }
  };

  const handleInspect = async () => {
    if (!inspectInput.trim()) return;
    setInspectLoading(true);
    try {
      const res = await ApiService.inspectOpenPGPKey(inspectInput);
      setInspection(res.data);
    } catch (err: any) {
      alert(`Failed to parse OpenPGP key: ${err.message}`);
      setInspection(null);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[#202020] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-2">
            <KeyRound size={13} /> RFC 4880 / 9580 Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
            OpenPGP Security Module
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            OpenPGP.js key generation, ASCII Armor inspection, authenticated session encryption, and cleartext digital signatures.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-2 border-[#202020] bg-white p-1">
          <button
            onClick={() => setActiveTab('GENERATE')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'GENERATE'
                ? 'bg-[#FF6B00] text-white shadow-[2px_2px_0_0_#202020]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Key Generator
          </button>
          <button
            onClick={() => setActiveTab('ENCRYPT_DECRYPT')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'ENCRYPT_DECRYPT'
                ? 'bg-[#202020] text-white shadow-[2px_2px_0_0_#202020]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Encrypt & Decrypt
          </button>
          <button
            onClick={() => setActiveTab('SIGN_VERIFY')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'SIGN_VERIFY'
                ? 'bg-[#D94B00] text-white shadow-[2px_2px_0_0_#202020]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Sign & Verify
          </button>
          <button
            onClick={() => setActiveTab('INSPECT')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'INSPECT'
                ? 'bg-[#202020] text-white shadow-[2px_2px_0_0_#202020]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Key Inspector
          </button>
        </div>
      </div>

      {/* TAB 1: KEY GENERATION */}
      {activeTab === 'GENERATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white border-3 border-[#202020] p-6 shadow-brutal space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100">
              Generate Demonstration OpenPGP Key Pair
            </h3>
            <p className="text-xs text-gray-600">
              Generates an RFC 4880 / 9580 compliant key pair in the browser and backend using OpenPGP.js.
            </p>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Full Name / User ID *
                </label>
                <input
                  type="text"
                  value={genName}
                  onChange={(e) => setGenName(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={genEmail}
                  onChange={(e) => setGenEmail(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Passphrase (Optional)
                </label>
                <input
                  type="password"
                  value={genPassphrase}
                  onChange={(e) => setGenPassphrase(e.target.value)}
                  placeholder="Optional private key password"
                  className="w-full p-2.5 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                  Cryptographic Algorithm
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenType('ecc')}
                    className={`p-2 text-xs font-bold border-2 ${
                      genType === 'ecc'
                        ? 'bg-[#FF6B00] text-white border-[#202020]'
                        : 'bg-white border-[#202020]'
                    }`}
                  >
                    Ed25519 (ECC Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenType('rsa')}
                    className={`p-2 text-xs font-bold border-2 ${
                      genType === 'rsa'
                        ? 'bg-[#FF6B00] text-white border-[#202020]'
                        : 'bg-white border-[#202020]'
                    }`}
                  >
                    RSA-2048 (Classic)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={genLoading}
                className="brutal-btn-primary w-full py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {genLoading ? 'Generating Key Pair...' : 'Generate OpenPGP Key Pair →'}
              </button>
            </form>

            <div className="p-3 bg-[#FFF0E5] border border-[#FF6B00] text-[11px] font-mono text-[#D94B00]">
              <strong>Security Guarantee:</strong> Generated keys remain local for academic demonstration and are not logged or transmitted externally.
            </div>
          </div>

          {/* Generated Key Inspection */}
          <div className="lg:col-span-7 bg-white border-3 border-[#202020] p-6 shadow-brutal-lg space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100">
              Generated OpenPGP Artifacts
            </h3>

            {generatedKey ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#FFFAF5] border border-[#202020] text-xs font-mono space-y-1">
                  <div><strong>Fingerprint (40 hex chars):</strong></div>
                  <div className="font-bold text-[#FF6B00] break-all">{generatedKey.fingerprint}</div>
                  <div><strong>Key ID:</strong> 0x{generatedKey.keyID}</div>
                  <div><strong>Algorithm:</strong> {generatedKey.algorithm}</div>
                  <div><strong>User:</strong> {generatedKey.user.name} &lt;{generatedKey.user.email}&gt;</div>
                </div>

                {/* Public Key Armor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-[#202020]">Public Key (ASCII Armor):</span>
                    <button
                      onClick={() => handleCopy(generatedKey.publicKey)}
                      className="text-xs font-mono text-[#FF6B00] hover:underline flex items-center gap-1"
                    >
                      {copiedKey ? <Check size={12} /> : <Copy size={12} />} Copy Public Key
                    </button>
                  </div>
                  <pre className="p-2.5 bg-[#111] text-green-400 font-mono text-[10px] overflow-x-auto max-h-48 border border-gray-800">
                    {generatedKey.publicKey}
                  </pre>
                </div>

                {/* Private Key Toggle */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle size={13} /> Private Key Armored Block:
                    </span>
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-xs font-mono text-gray-700 hover:text-black flex items-center gap-1 font-bold underline"
                    >
                      {showPrivateKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      {showPrivateKey ? 'Hide Private Key' : 'Reveal Demonstration Private Key'}
                    </button>
                  </div>

                  {showPrivateKey ? (
                    <pre className="p-2.5 bg-[#111] text-red-400 font-mono text-[10px] overflow-x-auto max-h-36 border border-red-900">
                      {generatedKey.privateKey}
                    </pre>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 text-xs font-mono text-gray-500 italic">
                      Private key is hidden to reinforce operational security habits. Click "Reveal" above if needed for testing.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs font-mono text-gray-500">
                Submit the form on the left to generate an authentic OpenPGP key pair.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENCRYPT & DECRYPT WORKBENCH */}
      {activeTab === 'ENCRYPT_DECRYPT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100 flex items-center gap-2">
              <Lock size={16} className="text-[#FF6B00]" /> OpenPGP Message Encryption
            </h3>
            <p className="text-xs text-gray-600">
              Encrypts plaintext using Bob Martinez public key (Curve25519) and signs with the sender key.
            </p>

            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                Plaintext Message:
              </label>
              <textarea
                rows={4}
                value={encPlaintext}
                onChange={(e) => setEncPlaintext(e.target.value)}
                className="w-full p-2.5 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <button
              onClick={handleEncrypt}
              disabled={encLoading}
              className="brutal-btn-primary w-full py-2.5 text-xs cursor-pointer"
            >
              Encrypt with Bob Martinez OpenPGP Key
            </button>

            {encryptedOutput && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#D94B00] bg-[#FFF0E5] px-2 py-0.5 border border-[#FF6B00]">
                  RFC 4880 CIPHERTEXT (ASCII ARMOR)
                </span>
                <pre className="p-2.5 bg-[#111] text-green-400 font-mono text-[10px] overflow-x-auto max-h-44 border border-gray-800">
                  {encryptedOutput}
                </pre>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal-lg space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100">
              Authorized Recipient Decryption
            </h3>
            <p className="text-xs text-gray-600">
              Uses Bob private key to unlock the session key and recover plaintext, verifying signature integrity.
            </p>

            <button
              onClick={handleDecrypt}
              disabled={!encryptedOutput || encLoading}
              className="brutal-btn-secondary w-full py-2.5 text-xs cursor-pointer disabled:opacity-50"
            >
              Decrypt with Bob Private Key
            </button>

            {decryptedPlaintext && (
              <div className="p-4 bg-green-50 border-2 border-green-600 space-y-2">
                <span className="text-xs font-bold text-green-900 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 size={14} /> AUTHENTICATED PLAINTEXT RESTORED:
                </span>
                <div className="p-3 bg-white border border-green-300 font-mono text-xs text-[#202020]">
                  {decryptedPlaintext}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SIGN & VERIFY WORKBENCH */}
      {activeTab === 'SIGN_VERIFY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100 flex items-center gap-2">
              <FileCheck2 size={16} className="text-[#D94B00]" /> OpenPGP Cleartext Signature Creation
            </h3>
            <p className="text-xs text-gray-600">
              Wraps plaintext in an ASCII Armor envelope containing a digital signature that guarantees message integrity and non-repudiation.
            </p>

            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                Statement to Sign:
              </label>
              <textarea
                rows={4}
                value={signMessage}
                onChange={(e) => setSignMessage(e.target.value)}
                className="w-full p-2.5 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <button
              onClick={handleSign}
              disabled={signLoading}
              className="brutal-btn-primary w-full py-2.5 text-xs cursor-pointer"
            >
              Generate Cleartext Signature
            </button>

            {signedCleartext && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-300">
                  SIGNED PGP MESSAGE
                </span>
                <pre className="p-2.5 bg-[#111] text-green-400 font-mono text-[10px] overflow-x-auto max-h-44 border border-gray-800">
                  {signedCleartext}
                </pre>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal-lg space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100">
              Signature Verification Workbench
            </h3>
            <p className="text-xs text-gray-600">
              Validates the cryptographic signature against Bob public key from the keyring.
            </p>

            <button
              onClick={handleVerify}
              disabled={!signedCleartext || signLoading}
              className="brutal-btn-secondary w-full py-2.5 text-xs cursor-pointer disabled:opacity-50"
            >
              Verify OpenPGP Signature
            </button>

            {verifyResult && (
              <div className="p-4 bg-[#FFFAF5] border-2 border-[#202020] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="font-bold">VERIFICATION RESULT:</span>
                  <span
                    className={`font-black px-2 py-0.5 text-[11px] ${
                      verifyResult.verified
                        ? 'bg-green-100 text-green-900 border border-green-600'
                        : 'bg-red-100 text-red-900 border border-red-600'
                    }`}
                  >
                    {verifyResult.verified ? 'MATHEMATICALLY VALID' : 'FAILED'}
                  </span>
                </div>
                <div><strong>Signer Key ID:</strong> 0x{verifyResult.keyID}</div>
                <div><strong>Public Key Fingerprint:</strong> <span className="break-all">{verifyResult.publicKeyFingerprint}</span></div>
                <div className="p-2 bg-white border border-gray-200 text-[11px] text-gray-600 mt-2">
                  <strong>Important Security Note:</strong> Cryptographic signature verification proves data integrity and possession of private key. Proof that the key belongs to a verified real-world entity requires Web-of-Trust certifications or out-of-band fingerprint confirmation.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: KEY INSPECTOR */}
      {activeTab === 'INSPECT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-gray-100">
              <h3 className="font-black text-sm uppercase text-[#202020]">
                OpenPGP Key Block (Public or Private)
              </h3>
              <button onClick={loadSampleBobKey} className="text-xs font-bold underline text-[#FF6B00]">
                Load Sample Key
              </button>
            </div>

            <textarea
              rows={12}
              value={inspectInput}
              onChange={(e) => setInspectInput(e.target.value)}
              placeholder="Paste -----BEGIN PGP PUBLIC KEY BLOCK-----..."
              className="w-full p-3 text-[11px] font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
            />

            <button
              onClick={handleInspect}
              disabled={inspectLoading}
              className="brutal-btn-primary w-full py-2.5 text-xs cursor-pointer"
            >
              Parse Key Block
            </button>
          </div>

          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal-lg space-y-3">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100">
              OpenPGP Key Structure Analysis
            </h3>

            {inspection ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-[#FFFAF5] border border-[#FFE0CC] space-y-1">
                  <div><strong>Primary User ID:</strong> <span className="font-sans font-bold text-[#202020]">{inspection.primaryUserID}</span></div>
                  <div><strong>Key Type:</strong> {inspection.isPrivate ? 'PRIVATE KEY (SECRET)' : 'PUBLIC KEY'}</div>
                  <div><strong>Key ID:</strong> 0x{inspection.keyID}</div>
                </div>

                <div className="p-2.5 bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">40-HEX DIGIT FINGERPRINT</span>
                  <span className="text-[11px] font-bold text-[#FF6B00] break-all">{inspection.fingerprint}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">ALGORITHM</span>
                    <span className="text-[11px] font-bold uppercase">{inspection.algorithm}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">REVOKED STATUS</span>
                    <span className="text-[11px] font-bold">{inspection.isRevoked ? 'REVOKED' : 'ACTIVE (NOT REVOKED)'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">CREATION TIME</span>
                    <span className="text-[11px]">{new Date(inspection.creationTime).toLocaleDateString()}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">EXPIRATION</span>
                    <span className="text-[11px]">{inspection.expirationTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 font-mono">
                Paste an armored key on the left to inspect its subpackets and fingerprints.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
